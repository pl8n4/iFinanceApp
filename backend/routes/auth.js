const express       = require('express');
const UserPassword  = require('../models/UserPassword');
const NonAdminUser  = require('../models/NonAdminUser');
const BaseUser      = require('../models/BaseUser');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({ message: 'userName and password required.' });
  }

  try {
    // look up credentials
    const up = await UserPassword.findOne({ where: { userName } });
    if (!up || up.encryptedPassword !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // fetch profile
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
