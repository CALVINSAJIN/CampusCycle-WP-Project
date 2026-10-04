const pool = require('../config/database');

exports.create = async (req, res) => {
  const { listing_id, message } = req.body;
  if (!listing_id || !message || !message.trim())
    return res.status(400).json({ success: false, message: 'Listing and message are required' });
  const listing = await pool.query('SELECT user_id, status FROM listings WHERE id = $1', [listing_id]);
  if (!listing.rows.length) return res.status(404).json({ success: false, message: 'Listing not found' });
  const { user_id: ownerId, status } = listing.rows[0]; // owner comes from the database, not the client
  if (ownerId === req.user.id)
    return res.status(400).json({ success: false, message: 'You cannot request your own item' });
  if (status !== 'AVAILABLE')
    return res.status(409).json({ success: false, message: `This item is already ${status.toLowerCase()}.` });
  const dup = await pool.query(
    `SELECT id FROM requests WHERE listing_id = $1 AND requester_id = $2 AND status <> 'REJECTED'`,
    [listing_id, req.user.id]
  );
  if (dup.rows.length) return res.status(409).json({ success: false, message: 'You have already requested this item' });
  const { rows } = await pool.query(
    'INSERT INTO requests (listing_id, requester_id, owner_id, message) VALUES ($1,$2,$3,$4) RETURNING *',
    [listing_id, req.user.id, ownerId, message.trim()]
  );
  res.status(201).json({ success: true, message: 'Item request sent successfully', data: rows[0] });
};

// Requests the user made or received.
// Privacy rule: phone/email are only returned once the request is ACCEPTED.
exports.getMine = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, l.title AS listing_title, l.status AS listing_status,
       q.name AS requester_name, o.name AS owner_name,
       CASE WHEN r.status = 'ACCEPTED' THEN o.phone END AS owner_phone,
       CASE WHEN r.status = 'ACCEPTED' THEN o.email END AS owner_email,
       CASE WHEN r.status = 'ACCEPTED' THEN q.phone END AS requester_phone,
       CASE WHEN r.status = 'ACCEPTED' THEN q.email END AS requester_email
     FROM requests r
     JOIN listings l ON l.id = r.listing_id
     JOIN users q ON q.id = r.requester_id
     JOIN users o ON o.id = r.owner_id
     WHERE r.requester_id = $1 OR r.owner_id = $1
     ORDER BY r.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
};

// Accept / reject. Accepting uses a transaction so request + listing stay consistent.
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!['ACCEPTED', 'REJECTED'].includes(status))
    return res.status(400).json({ success: false, message: 'Status must be ACCEPTED or REJECTED' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query(
      `SELECT r.*, l.status AS listing_status FROM requests r JOIN listings l ON l.id = r.listing_id
       WHERE r.id = $1 FOR UPDATE OF r, l`, [req.params.id]);
    const r = found.rows[0];
    const fail = async (code, message) => { await client.query('ROLLBACK'); return res.status(code).json({ success: false, message }); };
    if (!r) return fail(404, 'Request not found');
    if (r.owner_id !== req.user.id) return fail(403, 'Only the owner can respond to this request');
    if (r.status !== 'PENDING') return fail(409, 'This request has already been answered');
    if (status === 'ACCEPTED' && r.listing_status !== 'AVAILABLE') return fail(409, 'This item is no longer available');

    const updated = await client.query('UPDATE requests SET status = $1 WHERE id = $2 RETURNING *', [status, r.id]);
    if (status === 'ACCEPTED') {
      await client.query(`UPDATE requests SET status = 'REJECTED' WHERE listing_id = $1 AND id <> $2 AND status = 'PENDING'`, [r.listing_id, r.id]);
      await client.query(`UPDATE listings SET status = 'RESERVED', updated_at = NOW() WHERE id = $1`, [r.listing_id]);
    }
    await client.query('COMMIT');
    res.json({ success: true, message: `Request ${status.toLowerCase()}`, data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
