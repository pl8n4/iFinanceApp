const AccountCategory = require('../models/AccountCategory');

/**
 * Provides RESTful endpoints to list, retrieve, create, update, and delete account categories.
 * Implements CRUD operations by using Sequelize’s AccountCategory model to interact with the database.
 * Thhis file doesnt get used much, really only when the seed command for categories covered in the README
 * calls this file to create the neccassery categories.
 */

// Called to fetch and return all account categories
exports.getAll = async (req, res, next) => {
  try {
    const cats = await AccountCategory.findAll();
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

// Called to fetch and return a single account category by its ID
exports.getById = async (req, res, next) => {
  try {
    const cat = await AccountCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

// Creates a new account category
exports.create = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const created = await AccountCategory.create({ name, type });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Updates an existing account category
exports.update = async (req, res, next) => {
  try {
    const { name, type } = req.body;
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

// Removes an account category by its ID
exports.remove = async (req, res, next) => {
  try {
    const deleted = await AccountCategory.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
