module.exports = (err, req, res, next) => {
  console.error('Error:', err);
  console.error('Request body:', req.body);
  if (err.stack) console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
};
