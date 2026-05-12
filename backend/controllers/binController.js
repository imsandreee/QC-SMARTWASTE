const pool = require('../config/db');

// GET /api/bins  – all bins with latest status
const getAllBins = async (req, res) => {
  try {
    const [bins] = await pool.query(`
      SELECT
        b.*,
        br.name AS barangay_name,
        u.full_name AS collector_name,
        u.phone AS collector_phone,
        COALESCE(ls.fill_level, 0) AS fill_level,
        COALESCE(ls.temperature, 0) AS temperature,
        COALESCE(ls.humidity, 0) AS humidity,
        COALESCE(ls.battery_level, 100) AS battery_level,
        COALESCE(ls.status, 'empty') AS status,
        ls.recorded_at AS last_updated
      FROM bins b
      LEFT JOIN barangays br ON br.id = b.barangay_id
      LEFT JOIN users u ON u.id = b.assigned_collector_id
      LEFT JOIN (
        SELECT bin_id, fill_level, temperature, humidity, battery_level, status, recorded_at
        FROM bin_status s1
        WHERE recorded_at = (
          SELECT MAX(recorded_at) FROM bin_status s2 WHERE s2.bin_id = s1.bin_id
        )
        GROUP BY bin_id
      ) ls ON ls.bin_id = b.id
      WHERE b.is_active = 1
      ORDER BY b.id
    `);
    res.json(bins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bins/:id
const getBinById = async (req, res) => {
  try {
    const [bins] = await pool.query(`
      SELECT b.*, br.name AS barangay_name, u.full_name AS collector_name,
        ls.fill_level, ls.temperature, ls.humidity, ls.battery_level, ls.status, ls.recorded_at AS last_updated
      FROM bins b
      LEFT JOIN barangays br ON br.id = b.barangay_id
      LEFT JOIN users u ON u.id = b.assigned_collector_id
      LEFT JOIN (
        SELECT * FROM bin_status WHERE bin_id = ? ORDER BY recorded_at DESC LIMIT 1
      ) ls ON ls.bin_id = b.id
      WHERE b.id = ?
    `, [req.params.id, req.params.id]);
    if (!bins.length) return res.status(404).json({ message: 'Bin not found' });

    // Also get last 20 readings for chart
    const [history] = await pool.query(
      'SELECT fill_level, status, recorded_at FROM bin_status WHERE bin_id = ? ORDER BY recorded_at DESC LIMIT 20',
      [req.params.id]
    );
    res.json({ ...bins[0], history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bins  (admin only)
const createBin = async (req, res) => {
  const { bin_code, location_name, latitude, longitude, barangay_id, capacity_L, bin_type, assigned_collector_id, installed_at } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO bins (bin_code,location_name,latitude,longitude,barangay_id,capacity_L,bin_type,assigned_collector_id,installed_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [bin_code, location_name, latitude, longitude, barangay_id || null, capacity_L || 120, bin_type || 'general', assigned_collector_id || null, installed_at || null]
    );
    // Seed initial status
    await pool.query('INSERT INTO bin_status (bin_id, fill_level) VALUES (?,?)', [result.insertId, 0]);
    res.status(201).json({ id: result.insertId, message: 'Bin created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bins/:id  (admin only)
const updateBin = async (req, res) => {
  const { location_name, latitude, longitude, barangay_id, capacity_L, bin_type, assigned_collector_id, is_active } = req.body;
  try {
    await pool.query(
      `UPDATE bins SET location_name=?,latitude=?,longitude=?,barangay_id=?,capacity_L=?,bin_type=?,assigned_collector_id=?,is_active=? WHERE id=?`,
      [location_name, latitude, longitude, barangay_id, capacity_L, bin_type, assigned_collector_id, is_active ?? 1, req.params.id]
    );
    res.json({ message: 'Bin updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bins/:id  (admin only)
const deleteBin = async (req, res) => {
  try {
    await pool.query('UPDATE bins SET is_active=0 WHERE id=?', [req.params.id]);
    res.json({ message: 'Bin deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bins/stats/summary  – dashboard stats
const getStats = async (req, res) => {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*) AS total_bins,
        SUM(CASE WHEN ls.status='full' THEN 1 ELSE 0 END) AS full_bins,
        SUM(CASE WHEN ls.status='half' THEN 1 ELSE 0 END) AS half_bins,
        SUM(CASE WHEN ls.status='empty' THEN 1 ELSE 0 END) AS empty_bins
      FROM bins b
      LEFT JOIN (
        SELECT bin_id, status FROM bin_status s1
        WHERE recorded_at = (SELECT MAX(recorded_at) FROM bin_status s2 WHERE s2.bin_id = s1.bin_id)
        GROUP BY bin_id
      ) ls ON ls.bin_id = b.id
      WHERE b.is_active=1
    `);
    const [[collections]] = await pool.query('SELECT COUNT(*) AS total FROM collections WHERE DATE(collected_at)=CURDATE()');
    const [[users]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE is_active=1 AND role='collector'");
    res.json({ ...totals, collections_today: collections.total, active_collectors: users.total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bins/:id/collect  (collector)
const markCollected = async (req, res) => {
  const { notes } = req.body;
  const collectorId = req.user.id;
  try {
    // Get current fill level
    const [[latest]] = await pool.query(
      'SELECT fill_level FROM bin_status WHERE bin_id=? ORDER BY recorded_at DESC LIMIT 1',
      [req.params.id]
    );
    const fillBefore = latest ? latest.fill_level : 0;

    await pool.query(
      'INSERT INTO collections (bin_id,collector_id,fill_level_before,fill_level_after,notes) VALUES (?,?,?,?,?)',
      [req.params.id, collectorId, fillBefore, 0, notes || null]
    );
    // Reset fill level
    await pool.query(
      'INSERT INTO bin_status (bin_id, fill_level, temperature, humidity, battery_level) VALUES (?,0,NULL,NULL,100)',
      [req.params.id]
    );
    res.json({ message: 'Bin marked as collected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllBins, getBinById, createBin, updateBin, deleteBin, getStats, markCollected };
