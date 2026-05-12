const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/users  (admin only)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.phone, u.is_active, u.created_at, b.name AS barangay_name
      FROM users u
      LEFT JOIN barangays b ON b.id = u.barangay_id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/users  (admin only – create collector)
const createUser = async (req, res) => {
  const { full_name, email, password, role, phone, barangay_id } = req.body;
  try {
    const [ex] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (ex.length) return res.status(409).json({ message: 'Email already used' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name,email,password,role,phone,barangay_id) VALUES (?,?,?,?,?,?)',
      [full_name, email, hashed, role || 'citizen', phone || null, barangay_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'User created' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/users/:id  (admin or own profile)
const updateUser = async (req, res) => {
  const { full_name, phone, barangay_id, is_active, password } = req.body;
  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password=? WHERE id=?', [hashed, req.params.id]);
    }
    await pool.query(
      'UPDATE users SET full_name=?,phone=?,barangay_id=?,is_active=? WHERE id=?',
      [full_name, phone || null, barangay_id || null, is_active ?? 1, req.params.id]
    );
    res.json({ message: 'User updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/users/:id  (admin only – soft delete)
const deleteUser = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active=0 WHERE id=?', [req.params.id]);
    res.json({ message: 'User deactivated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/users/barangays
const getBarangays = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM barangays ORDER BY name');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/users/collectors  (for bin assignment dropdown)
const getCollectors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, phone FROM users WHERE role='collector' AND is_active=1"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser, getBarangays, getCollectors };
