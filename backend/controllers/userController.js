const bcrypt = require('bcrypt');
const BaseUser = require('../models/BaseUser');
const UserPassword = require('../models/UserPassword');
const NonAdminUser = require('../models/NonAdminUser');
const Administrator = require('../models/Administrator');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

// Helper to enforce admin-only actions
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required.' });
  }
  next();
}

// Create a new user (admin-only)
exports.createUser = [requireAdmin, async (req, res, next) => {
    try {
    const { name, userName, password, role, email, address, dateHired, dateFinished } = req.body;
    if (!name || !userName || !password || !role) {
      return res.status(400).json({ message: 'name, userName, password, and role are required.' });
    }
    // Check username uniqueness
    const existingUser = await BaseUser.findOne({ where: { userName } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already in use.' });
    }
    // Hash password
    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    // Create BaseUser record
    const user = await BaseUser.create({ name, userName, role });
    // Store credentials
    await UserPassword.create({ id: user.id, userName, encryptedPassword });
    // Create specific profile based on role
    if (role === 'non-admin') {
      if (!email) {
        return res.status(400).json({ message: 'email is required for non-admin users.' });
      }
      await NonAdminUser.create({ id: user.id, email, address, AdministratorId: null });
    } else if (role === 'admin') {
      if (!dateHired) {
        return res.status(400).json({ message: 'dateHired is required for admin users.' });
      }
      await Administrator.create({ id: user.id, dateHired, dateFinished });
    }
    res.status(201).json({ id: user.id, name: user.name, userName: user.userName, role: user.role });
  } catch (err) {
    next(err);
  }
}];

// Retrieve all users (admin-only)
exports.getAllUsers = [requireAdmin, async (req, res, next) => {
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
    next(err);
  }
}];

// Retrieve single user by ID (admin-only)
exports.getUserById = [requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await BaseUser.findByPk(id, {
      include: [
        { model: UserPassword, as: 'shadow', attributes: ['userName'] },
        { model: NonAdminUser, as: 'userProfile', attributes: ['email', 'address'] },
        { model: Administrator, as: 'adminProfile', attributes: ['dateHired', 'dateFinished'] }
      ],
      attributes: ['id', 'name', 'role']
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}];

// Update user (admin-only)
exports.updateUser = [requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, address, dateFinished } = req.body;
    const user = await BaseUser.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Update BaseUser
    if (name) user.name = name;
    await user.save();
    // Update profiles
    if (user.role === 'non-admin') {
      const profile = await NonAdminUser.findByPk(id);
      if (email) profile.email = email;
      if (address) profile.address = address;
      await profile.save();
    } else if (user.role === 'admin') {
      const adminProfile = await Administrator.findByPk(id);
      if (dateFinished) adminProfile.dateFinished = dateFinished;
      await adminProfile.save();
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}];

// Delete user (admin-only)
exports.deleteUser = [requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await BaseUser.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Cascade delete: remove credential and profile
    await UserPassword.destroy({ where: { id } });
    if (user.role === 'non-admin') {
      await NonAdminUser.destroy({ where: { id } });
    } else if (user.role === 'admin') {
      await Administrator.destroy({ where: { id } });
    }
    await BaseUser.destroy({ where: { id } });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}];