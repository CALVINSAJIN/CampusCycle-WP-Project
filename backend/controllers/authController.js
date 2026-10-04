const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const makeToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = ({ id, name, email, phone, department, role }) => ({ id, name, email, phone, department, role });

exports.register = async (req, res) => {
  const { name, email, password, phone, department } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  if (!email.toLowerCase().endsWith('@rajagiri.edu.in'))
    return res.status(400).json({ success: false, message: 'Only @rajagiri.edu.in emails are allowed' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (exists.rows.length) return res.status(409).json({ success: false, message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password, phone, department) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, email.toLowerCase(), hash, phone || null, department || null]
  );
  res.status(201).json({ success: true, message: 'Registered successfully', data: { token: makeToken(rows[0]), user: publicUser(rows[0]) } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  res.json({ success: true, message: 'Login successful', data: { token: makeToken(user), user: publicUser(user) } });
};

exports.me = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: publicUser(rows[0]) });
};
