const Group = require('../models/Group');

exports.getAll = async (req, res, next) => {
  try {
    // Fetch every group (including its AccountCategoryId and parentId)
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    // Lookup by primary key
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: 'Not found' });
    res.json(group);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    // Destructure the fields from the request
    const { name, AccountCategoryId, parentId } = req.body;
    // Create and return 201
    const created = await Group.create({ name, AccountCategoryId, parentId });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, AccountCategoryId, parentId } = req.body;
    // update returns [numberOfRowsAffected]
    const [updated] = await Group.update(
      { name, AccountCategoryId, parentId },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    // Return the fresh record
    const fresh = await Group.findByPk(req.params.id);
    res.json(fresh);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Group.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    // 204 No Content
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
