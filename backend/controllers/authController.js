const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
require('dotenv').config();

const BaseUser = require('../models/BaseUser');
const UserPassword = require('../models/UserPassword');
const NonAdminUser = require('../models/NonAdminUser');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// Still to be implemented: change-password

/**
 * POST /api/auth/login
 * { username, password } → { token, user: { id, username, name, email, role } }
 */

// Input validation
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password required.' });
    }

    // 1) Fetch userPassword by username
    const pwRec = await UserPassword.findOne({ where: { userName: username } });
    if (!pwRec) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 2) Compares submitted password against stored one
    const ok = await bcrypt.compare(password, pwRec.encryptedPassword);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3) Fetch user profile 
    const user = await BaseUser.findByPk(pwRec.id, {
      include: [
        { model: NonAdminUser, as: 'nonAdminProfile', attributes: ['email'] }
      ],
      attributes: ['id', 'userName', 'role', 'name']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 4) Creates a token
    const payload = { id: user.id, role: user.role };
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    // 5) Return token + minimal user info
    res.json({
      token,
      user: {
        id: user.id,
        username: user.userName,
        name:     user.name,
        email:    user.nonAdminProfile?.email,
        role:     user.role
      }
    });
  } catch (err) {
    next(err);
  }
};