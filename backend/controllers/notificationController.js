const pool = require('../config/db');
const { sendSMS } = require('../services/smsService');

// GET /api/notifications  (admin)
const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT n.*, u.full_name AS recipient_name, b.bin_code, b.location_name
      FROM notifications n
      LEFT JOIN users u ON u.id = n.recipient_id
      LEFT JOIN bins b ON b.id = n.bin_id
      ORDER BY n.created_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/notifications/send  (admin manual blast)
const sendManual = async (req, res) => {
  const { phone, message, recipient_id, bin_id } = req.body;
  if (!phone || !message)
    return res.status(400).json({ message: 'phone and message required' });
  try {
    const result = await sendSMS({
      phone, message, type: 'manual', binId: bin_id || null, recipientId: recipient_id || null,
    });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/notifications/my  (collector – their own notifications)
const getMine = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, b.bin_code, b.location_name FROM notifications n
       LEFT JOIN bins b ON b.id = n.bin_id
       WHERE n.recipient_id = ? ORDER BY n.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAll, sendManual, getMine };
