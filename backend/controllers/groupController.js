const Group = require('../models/Group');
const AccountCategory = require('../models/AccountCategory');
const { verifyToken } = require('../middleware/authMiddleware'); // Assume auth middleware is applied in route


// Fetches every group (including its AccountCategoryId and parentId)
exports.getAll = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      where: {NonAdminUserId: req.user.id}
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
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: 'Not found' });
    res.json(group);
  } catch (err) {
    console.error('Failed to fetch group by ID:', err);
    next(err);
  }
};

// Creates a new group
// Expects { name, AccountCategoryId, parentId }
exports.create = async (req, res, next) => {
  try {
    const { name, AccountCategoryId, parentId } = req.body;
    const created = await Group.create({ name, AccountCategoryId, parentId,
      NonAdminUserId: req.user.id
     });
    res.status(201).json(created);
  } catch (err) {
    console.error('Failed to create group:', err);
    next(err);
  }
};

// Updates an existing group
// Expects { name, AccountCategoryId, parentId }
exports.update = async (req, res, next) => {
  try {
    const { name, AccountCategoryId, parentId } = req.body;
    const [updated] = await Group.update(
      { name, AccountCategoryId, parentId: parentId || null },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: 'Not found' });
    const fresh = await Group.findByPk(req.params.id);
    res.json(fresh);
  } catch (err) {
    console.error('Failed to update group:', err);
    next(err);
  }
};

// Remove a group by its ID
exports.remove = async (req, res, next) => {
  try {
    const deleted = await Group.destroy({ where: { id: req.params.id, NonAdminUserId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found or not your group' });
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete group:', err);
    next(err);
  }
};
