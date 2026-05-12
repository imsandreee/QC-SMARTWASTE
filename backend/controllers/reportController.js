const pool = require('../config/db');

// GET /api/reports  (admin sees all, collector sees assigned area, citizen sees own)
const getAll = async (req, res) => {
  try {
    let query = `
      SELECT r.*, b.bin_code, b.location_name, u.full_name AS citizen_name
      FROM reports r
      JOIN bins b ON b.id = r.bin_id
      JOIN users u ON u.id = r.citizen_id
    `;
    const params = [];
    if (req.user.role === 'citizen') {
      query += ' WHERE r.citizen_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY r.created_at DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/reports  (citizen)
const create = async (req, res) => {
  const { bin_id, issue_type, description } = req.body;
  if (!bin_id || !issue_type) return res.status(400).json({ message: 'bin_id and issue_type required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO reports (bin_id, citizen_id, issue_type, description) VALUES (?,?,?,?)',
      [bin_id, req.user.id, issue_type, description || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Report submitted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/reports/:id/status  (admin/collector)
const updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const resolved_at = status === 'resolved' ? new Date() : null;
    await pool.query(
      'UPDATE reports SET status=?, resolved_at=? WHERE id=?',
      [status, resolved_at, req.params.id]
    );
    res.json({ message: 'Report status updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/reports/collections  – collection history
const getCollections = async (req, res) => {
  try {
    let query = `
      SELECT c.*, b.bin_code, b.location_name, u.full_name AS collector_name
      FROM collections c
      JOIN bins b ON b.id = c.bin_id
      JOIN users u ON u.id = c.collector_id
    `;
    const params = [];
    if (req.user.role === 'collector') {
      query += ' WHERE c.collector_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY c.collected_at DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAll, create, updateStatus, getCollections };
