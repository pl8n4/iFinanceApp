const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const BaseUser = require('../models/BaseUser');
const UserPassword = require('../models/UserPassword');
const NonAdminUser = require('../models/NonAdminUser');

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', req.body); // ✅ LOGGING HERE

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password required.' });
    }

    const pwRec = await UserPassword.findOne({ where: { userName: username } });
    if (!pwRec) {
      console.log('❌ User not found in UserPasswords');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const ok = await bcrypt.compare(password, pwRec.encryptedPassword);
    if (!ok) {
      console.log('❌ Password does not match');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = await BaseUser.findByPk(pwRec.id, {
      include: [{ model: NonAdminUser, as: 'userProfile', attributes: ['email'] }],
      attributes: ['id', 'name']
    });

    if (!user) {
      console.log('❌ BaseUser not found');
      return res.status(404).json({ message: 'User not found.' });
    }

    const role = user.nonAdminProfile ? 'user' : 'admin';
    const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: username,
        name: user.name,
        email: user.userProfile?.email,
        role: user.userProfile ? 'user' : 'admin'
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const pwRec = await UserPassword.findByPk(userId);
    if (!pwRec) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(oldPassword, pwRec.encryptedPassword);
    if (!match) return res.status(400).json({ message: 'Old password is incorrect.' });

    pwRec.encryptedPassword = await bcrypt.hash(newPassword, 10);
    await pwRec.save();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
