const express = require('express');
const router = express.Router();
const BaseUser = require('../models/BaseUser');
const UserPassword = require('../models/UserPassword');
const Administrator = require('../models/Administrator');
const NonAdminUser = require('../models/NonAdminUser');
const sequelize = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Create a new user (admin only)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { name, userName, password, role, email, address } = req.body;
  console.log('Received user creation request:', { name, userName, role, email, address });

  const transaction = await sequelize.transaction();
  try {
    // Validate inputs
    if (!name || !userName || !password || !role) {
      throw new Error('Missing required fields');
    }
    if (role === 'user' && !email) {
      throw new Error('Email is required for non-admin users');
    }
    console.log('Role received:', role);
    if (!['admin', 'user'].includes(role)) {
      throw new Error('Invalid role');
    }

    // Check if userName already exists
    const existingUser = await BaseUser.findOne({ where: { userName } }, { transaction });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create BaseUser
    const baseUser = await BaseUser.create(
      { name, userName, role },
      { transaction }
    );
    console.log('Created BaseUser:', baseUser.toJSON());

    // Create UserPassword
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserPassword.create(
      { id: baseUser.id, userName, encryptedPassword: hashedPassword },
      { transaction }
    );
    console.log('Created UserPassword');

    // Create Administrator or NonAdminUser based on role
    if (role === 'admin') {
      console.log('Creating Administrator...');
      const admin = await Administrator.create(
        { id: baseUser.id, dateHired: new Date() },
        { transaction }
      );
      console.log('Administrator created:', admin.toJSON());
    } else {
      console.log('Creating NonAdminUser...');
      const nonAdmin = await NonAdminUser.create(
        { id: baseUser.id, email, address },
        { transaction }
      );
      console.log('NonAdminUser created:', nonAdmin.toJSON());
    }

    await transaction.commit();
    console.log('Transaction committed');
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    await transaction.rollback();
    console.error('Error creating user:', err);
    res.status(400).json({ message: err.message || 'Failed to create user' });
  }
});

module.exports = router;