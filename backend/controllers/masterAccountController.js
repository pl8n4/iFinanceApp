const MasterAccount = require('../models/MasterAccount');
const Group         = require('../models/Group');

// 1) Only fetch this user’s accounts
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

// 2) Fetch one account by ID (ensure it belongs to this user)
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

// 3) Create a new account, attaching the user ID
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

// 4) Update an existing account (only if it belongs to this user)
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

// 5) Delete an account (only if it belongs to this user)
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
