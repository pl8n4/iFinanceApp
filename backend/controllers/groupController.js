const Group = require('../models/Group');
const { Op } = require('sequelize');

// Fetches groups for the authenticated user
exports.getAll = async (req, res, next) => {
  try {
    console.log('req.user:', req.user);
    const groups = await Group.findAll({
      where: { NonAdminUserId: req.user.id }
    });
    res.json(groups);
  } catch (err) {
    console.error('Failed to fetch groups:', err);
    next(err);
  }
};

// Fetches a single group by its ID
exports.getById = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      where: {
        id: req.params.id,
        NonAdminUserId: req.user.id
      }
    });
    if (!group) return res.status(404).json({ message: 'Group not found or not yours' });
    res.json(group);
  } catch (err) {
    console.error('Failed to fetch group by ID:', err);
    next(err);
  }
};

// Creates a new group
exports.create = async (req, res, next) => {
  try {
    const { name, AccountCategoryId, parentId } = req.body;

    // Check if a group with this name already exists for the user
    const existingGroup = await Group.findOne({
      where: {
        name,
        NonAdminUserId: req.user.id
      }
    });
    if (existingGroup) {
      return res.status(400).json({ message: 'Group name already exists for this user' });
    }

    // Validate parentId if provided
    let validatedParentId = parentId || null;
    if (parentId) {
      const parentGroup = await Group.findOne({
        where: {
          id: parentId,
          NonAdminUserId: req.user.id
        }
      });
      if (!parentGroup) {
        return res.status(400).json({ message: 'Parent group not found or does not belong to user' });
      }
      validatedParentId = parentGroup.id;
    }

    const created = await Group.create({
      name,
      AccountCategoryId,
      parentId: validatedParentId,
      NonAdminUserId: req.user.id
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Failed to create group:', err);
    next(err);
  }
};

// Updates an existing group
exports.update = async (req, res, next) => {
  try {
    const { name, AccountCategoryId, parentId } = req.body;

    // Find the group and ensure it belongs to the user
    const group = await Group.findOne({
      where: {
        id: req.params.id,
        NonAdminUserId: req.user.id
      }
    });
    if (!group) return res.status(404).json({ message: 'Group not found or not yours' });

    // If updating the name, ensure the new name doesn't already exist
    let newName = group.name;
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({
        where: {
          name,
          NonAdminUserId: req.user.id,
          id: { [Op.ne]: req.params.id }
        }
      });
      if (existingGroup) {
        return res.status(400).json({ message: 'Group name already exists for this user' });
      }
      newName = name;
    }

    // Validate parentId if provided
    let validatedParentId = group.parentId;
    if (parentId !== undefined) {
      validatedParentId = parentId || null;
      if (parentId) {
        const parentGroup = await Group.findOne({
          where: {
            id: parentId,
            NonAdminUserId: req.user.id
          }
        });
        if (!parentGroup) {
          return res.status(400).json({ message: 'Parent group not found or does not belong to user' });
        }
        validatedParentId = parentGroup.id;
      }
    }

    await group.update({
      name: newName,
      AccountCategoryId: AccountCategoryId || group.AccountCategoryId,
      parentId: validatedParentId
    });
    res.json(group);
  } catch (err) {
    console.error('Failed to update group:', err);
    next(err);
  }
};

// Remove a group by its ID
exports.remove = async (req, res, next) => {
  try {
    const deleted = await Group.destroy({
      where: {
        id: req.params.id,
        NonAdminUserId: req.user.id
      }
    });
    if (!deleted) return res.status(404).json({ message: 'Group not found or not yours' });
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete group:', err);
    next(err);
  }
};