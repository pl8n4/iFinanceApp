const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

// Verifies the token and extracts the user info
exports.verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;  // e.g. { id, role }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
