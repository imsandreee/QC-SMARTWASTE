const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [rows] = await pool.query(
      `SELECT u.*, b.name AS barangay_name
       FROM users u
       LEFT JOIN barangays b ON b.id = u.barangay_id
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/register  (citizen self-registration)
const register = async (req, res) => {
  const { full_name, email, password, phone, barangay_id } = req.body;
  if (!full_name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password required' });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role, phone, barangay_id) VALUES (?,?,?,?,?,?)',
      [full_name, email, hashed, 'citizen', phone || null, barangay_id || null]
    );
    const token = generateToken(result.insertId, 'citizen');
    res.status(201).json({ token, user: { id: result.insertId, full_name, email, role: 'citizen' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { login, register, getMe };
