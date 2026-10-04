const pool = require('../config/database');

const CATEGORIES = ['Books', 'Electronics', 'Lab Equipment', 'Stationery', 'Academic Materials', 'Others'];
const CONDITIONS = ['LIKE_NEW', 'GOOD', 'FAIR'];

// Returns an error message string, or null if the body is valid
const validate = (b) => {
  if (!b.title || !b.description || !b.category || !b.condition || !b.location)
    return 'Title, description, category, condition and location are required';
  if (!CATEGORIES.includes(b.category)) return 'Invalid category';
  if (!CONDITIONS.includes(b.condition)) return 'Invalid condition';
  return null;
};

const BASE = 'SELECT l.*, u.name AS owner_name, u.department AS owner_department FROM listings l JOIN users u ON u.id = l.user_id';

exports.getAll = async (req, res) => {
  const { search, category, condition, status } = req.query;
  const { rows } = await pool.query(
    `${BASE}
     WHERE ($1::text IS NULL OR l.title ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR l.category = $2)
       AND ($3::text IS NULL OR l.condition = $3)
       AND ($4::text IS NULL OR l.status = $4)
     ORDER BY (l.status = 'AVAILABLE') DESC, l.created_at DESC`,
    [search || null, category || null, condition || null, status || null]
  );
  res.json({ success: true, data: rows });
};

exports.getOne = async (req, res) => {
  const { rows } = await pool.query(`${BASE} WHERE l.id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Listing not found' });
  res.json({ success: true, data: rows[0] });
};

exports.create = async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error });
  const b = req.body;
  const { rows } = await pool.query(
    `INSERT INTO listings (user_id, title, description, category, condition, image_url, location)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.id, b.title, b.description, b.category, b.condition, b.image_url, b.location]
  );
  res.status(201).json({ success: true, message: 'Listing created successfully', data: rows[0] });
};

exports.update = async (req, res) => {
  const found = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
  if (!found.rows.length) return res.status(404).json({ success: false, message: 'Listing not found' });
  if (found.rows[0].user_id !== req.user.id)
    return res.status(403).json({ success: false, message: 'You are not authorized to edit this listing' });
  const b = { ...found.rows[0], ...req.body };
  const error = validate(b);
  if (error) return res.status(400).json({ success: false, message: error });
  const { rows } = await pool.query(
    `UPDATE listings SET title=$1, description=$2, category=$3, condition=$4,
       image_url=$5, location=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
    [b.title, b.description, b.category, b.condition, b.image_url, b.location, req.params.id]
  );
  res.json({ success: true, message: 'Listing updated successfully', data: rows[0] });
};

exports.remove = async (req, res) => {
  const found = await pool.query('SELECT user_id FROM listings WHERE id = $1', [req.params.id]);
  if (!found.rows.length) return res.status(404).json({ success: false, message: 'Listing not found' });
  if (found.rows[0].user_id !== req.user.id)
    return res.status(403).json({ success: false, message: 'You are not authorized to delete this listing' });
  await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Listing deleted successfully' });
};

// Handover: owner marks a RESERVED item as COMPLETED
exports.setStatus = async (req, res) => {
  if (req.body.status !== 'COMPLETED')
    return res.status(400).json({ success: false, message: 'Only COMPLETED can be set (RESERVED happens when a request is accepted)' });
  const found = await pool.query('SELECT user_id, status FROM listings WHERE id = $1', [req.params.id]);
  if (!found.rows.length) return res.status(404).json({ success: false, message: 'Listing not found' });
  if (found.rows[0].user_id !== req.user.id)
    return res.status(403).json({ success: false, message: 'Only the owner can complete the handover' });
  if (found.rows[0].status !== 'RESERVED')
    return res.status(409).json({ success: false, message: 'Only a RESERVED item can be marked as handed over' });
  const { rows } = await pool.query(`UPDATE listings SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1 RETURNING *`, [req.params.id]);
  res.json({ success: true, message: 'Handover completed', data: rows[0] });
};
