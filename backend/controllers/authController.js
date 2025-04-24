const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
require('dotenv').config();

const BaseUser = require('../models/BaseUser');
const UserPassword = require('../models/UserPassword');
const NonAdminUser = require('../models/NonAdminUser');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// Here we handle all the authentication related tasks for login and password change

/**
 * POST /api/auth/login
 * { username, password } -> { token, user: { id, username, name, email, role } }
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
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    // 5) Return token + minimal user info
    res.json({
      token,
      user: {
        id: user.id,
        username: user.userName,
        name: user.name,
        email: user.nonAdminProfile?.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/change-password
// Body: { oldPassword, newPassword }
exports.changePassword = async (req, res, next) => {
    try {
      const userId = req.user.id;          // set by authMiddleware
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old and new passwords required.' });
      }
  
      // 1) Fetch the existing password record
      const pwRec = await UserPassword.findByPk(userId);
      if (!pwRec) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // 2) Verify the old password
      const match = await bcrypt.compare(oldPassword, pwRec.encryptedPassword);
      if (!match) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
      }
  
      // 3) Hash & save the new password
      const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      pwRec.encryptedPassword = hash;
      await pwRec.save();
  
      // 4) Respond with no content
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  };