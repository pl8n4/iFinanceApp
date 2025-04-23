const express       = require('express');
const { v4: uuidv4 }= require('uuid');
const bcrypt = require('bcrypt');
const BaseUser      = require('../models/BaseUser');
const UserPassword  = require('../models/UserPassword');
const NonAdminUser  = require('../models/NonAdminUser');

const router = express.Router();

// POST /api/non-admin-users
router.post('/', async (req, res) => {
  try {
    const { name, address, email, userName, password } = req.body;
    if (!name || !address || !email || !userName || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Creates a base user
    const id = uuidv4();
    await BaseUser.create({ id, name });

    // 2) Encrypts password and stores credentials
    const hash = await bcrypt.hash(password, 10);
    await UserPassword.create({
      id,
      userName,
      encryptedPassword: hash
    });

    // Creates a non-admin user
    await NonAdminUser.create({
      id,
      address,
      email,
      AdministratorId: null
    });

    res.status(201).json({ id, name, email, userName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;