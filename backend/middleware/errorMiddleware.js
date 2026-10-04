// Lets async controllers send errors to errorHandler
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.code === '23505') return res.status(409).json({ success: false, message: 'Already exists' });
  res.status(500).json({ success: false, message: 'Server error' });
};
module.exports = { asyncHandler, notFound, errorHandler };
