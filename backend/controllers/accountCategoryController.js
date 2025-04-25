const AccountCategory = require('../models/AccountCategory');

exports.getAll = async (req, res, next) => {
  try {
    // Fetch every AccountCategory row
    const cats = await AccountCategory.findAll();
    res.json(cats);
  } catch (err) {
    // Delegate errors to your global error handler
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    // Look up a single category by its UUID
    const cat = await AccountCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    // Destructure the two required fields
    const { name, type } = req.body;
    // Create + return the new record with 201 status
    const created = await AccountCategory.create({ name, type });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    // Sequelize.update returns [numberOfRowsAffected]
    const [updated] = await AccountCategory.update(
      { name, type },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    // Fetch the fresh record to return the updated state
    const fresh = await AccountCategory.findByPk(req.params.id);
    res.json(fresh);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    // Destroy by PK
    const deleted = await AccountCategory.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    // 204 No Content on success
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
