const express = require('express');
const router = express.Router();
const BaseUser = require('../models/BaseUser');
const UserPassword = require('../models/UserPassword');
const Administrator = require('../models/Administrator');
const NonAdminUser = require('../models/NonAdminUser');
const sequelize = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Helper to enforce admin-only actions
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// GET /api/users - Retrieve all users (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await BaseUser.findAll({
      include: [
        { model: UserPassword, as: 'shadow', attributes: ['userName'] },
        { model: NonAdminUser, as: 'userProfile', attributes: ['email', 'address'] },
        { model: Administrator, as: 'adminProfile', attributes: ['dateHired', 'dateFinished'] }
      ],
      attributes: ['id', 'name', 'role']
    });
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
    next(err);
  }
});

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

// <mark> Define PUT route for updating a user (admin only) </mark>
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const user = await BaseUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ name });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// <mark> Define DELETE route for deleting a user (admin only) </mark>
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await BaseUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;