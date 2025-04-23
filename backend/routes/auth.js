const express = require('express');
const bcrypt = require('bcrypt');
const UserPassword  = require('../models/UserPassword');
const NonAdminUser  = require('../models/NonAdminUser');
const BaseUser      = require('../models/BaseUser');

const router = express.Router();

// POST /api/auth/login
// Handles user login by validating credentials and returning user profile information
router.post('/login', async (req, res) => {
  const { userName, password } = req.body;
  // Check if userName and password are provided
  if (!userName || !password) {
    return res.status(400).json({ message: 'userName and password required.' });
  }

  try {
    // Checks if user exists and password matches
    const up = await UserPassword.findOne({ where: { userName } });
    const valid = await bcrypt.compare(password, up.encryptedPassword);
    if (!up || !valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    };
    // Fetches the user profile
    const profile = await NonAdminUser.findByPk(up.id, {
        include: [{ model: BaseUser, attributes: ['name'] }]
    });

    res.json({
      id: profile.id,
      name: profile.BaseUser.name,
      email: profile.email,
      userName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
