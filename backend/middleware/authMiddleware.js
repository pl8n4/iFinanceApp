const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

// Verifies the token and extracts the user info
exports.verifyToken = (req, res, next) => {
  
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  console.log('→ JWT token:', token);
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.log('→ JWT verify error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
