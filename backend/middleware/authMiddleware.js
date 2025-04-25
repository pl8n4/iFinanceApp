const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

exports.verifyToken = (req, res, next) => {
  // Grab the Bearer token from the Authorization header
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Declare payload with const so no ReferenceError
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error('→ JWT verify error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
