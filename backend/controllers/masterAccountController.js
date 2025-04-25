const MasterAccount = require('../models/MasterAccount');
const Group         = require('../models/Group');


/**
 * Manages CRUD operations for MasterAccount for an authenticated non-admin user,
 * uses Sequelize’s MasterAccount and Group models to interact with the database.
 */

// Fetches all accounts that belong to the authenticated user
exports.getAll = async (req, res, next) => {
  try {
    const accounts = await MasterAccount.findAll({
      where: { NonAdminUserId: req.user.id },
      include: [{ model: Group, as: 'accountGroup' }]
    });
    res.json(accounts);
  } catch (err) {
    next(err);
  }
};

// Fetches a single account by its ID, only if it belongs to the authenticated user
exports.getById = async (req, res, next) => {
  try {
    const acct = await MasterAccount.findOne({
      where: { id: req.params.id, NonAdminUserId: req.user.id },
      include: [{ model: Group, as: 'accountGroup' }]
    });
    if (!acct) return res.status(404).json({ message: 'Not found' });
    res.json(acct);
  } catch (err) {
    next(err);
  }
};

// Creates a new account for the authenticated user
exports.create = async (req, res, next) => {
  try {
    const NonAdminUserId = req.user.id;
    const { name, openingAmount, closingAmount, GroupId } = req.body;
    const created = await MasterAccount.create({
      name,
      openingAmount,
      closingAmount,
      GroupId,
      NonAdminUserId
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Updates an existing account, only if it belongs to the authenticated user
exports.update = async (req, res, next) => {
  try {
    const { name, openingAmount, closingAmount, GroupId } = req.body;
    const [updated] = await MasterAccount.update(
      { name, openingAmount, closingAmount, GroupId },
      {
        where: { id: req.params.id, NonAdminUserId: req.user.id }
      }
    );
    if (!updated) return res.status(404).json({ message: 'Not found or unauthorized' });
    const fresh = await MasterAccount.findByPk(req.params.id);
    res.json(fresh);
  } catch (err) {
    next(err);
  }
};

// Called to remove an account by its ID, only if it belongs to the authenticated user
exports.remove = async (req, res, next) => {
  try {
    const deleted = await MasterAccount.destroy({
      where: { id: req.params.id, NonAdminUserId: req.user.id }
    });
    if (!deleted) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
