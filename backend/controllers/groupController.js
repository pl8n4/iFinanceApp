const Group = require('../models/Group');
const AccountCategory = require('../models/AccountCategory');
const { verifyToken } = require('../middleware/authMiddleware'); // Assume auth middleware is applied in route

// Fetch all groups
exports.getAll = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      include: [{ model: AccountCategory, as: 'element', attributes: ['name', 'type'] }]
    });
    res.json(groups);
  } catch (err) {
    console.error('❌ Failed to fetch groups:', err);
    next(err);
  }
};

// Get group by ID
exports.getById = async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [{ model: AccountCategory, as: 'element', attributes: ['name', 'type'] }]
    });
    if (!group) return res.status(404).json({ message: 'Not found' });
    res.json(group);
  } catch (err) {
    console.error('❌ Failed to fetch group by ID:', err);
    next(err);
  }
};

// Create new group
exports.create = async (req, res, next) => {
  try {
    const { name, AccountCategoryId, parentId } = req.body;

    // Ensure AccountCategory exists
    const category = await AccountCategory.findByPk(AccountCategoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid AccountCategoryId' });
    }

    const created = await Group.create({ name, AccountCategoryId, parentId: parentId || null });
    res.status(201).json(created);
  } catch (err) {
    console.error('❌ Failed to create group:', err);
    next(err);
  }
};

// Update group
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
    console.error('❌ Failed to update group:', err);
    next(err);
  }
};

// Delete group
exports.remove = async (req, res, next) => {
  try {
    const deleted = await Group.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error('❌ Failed to delete group:', err);
    next(err);
  }
};
