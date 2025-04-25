const MasterAccount = require('../models/MasterAccount');



// fetches all master accounts
exports.getAll = async (req, res, next) => {
  try {
    const accounts = await MasterAccount.findAll();
    res.json(accounts);
  } catch (err) {
    next(err);
  }
};

// fetches one master account by ID 
exports.getById = async (req, res, next) => {
  try {
    const acct = await MasterAccount.findByPk(req.params.id);
    if (!acct) return res.status(404).json({ message: 'Not found' });
    res.json(acct);
  } catch (err) {
    next(err);
  }
};

// Creates a new master account.
// Expects { name, openingAmount, closingAmount, GroupId }
exports.create = async (req, res, next) => {
  try {
    const { name, openingAmount, closingAmount, GroupId } = req.body;
    const created = await MasterAccount.create({
      name,
      openingAmount,
      closingAmount,
      GroupId
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// updates an existing master account.
exports.update = async (req, res, next) => {
  try {
    const { name, openingAmount, closingAmount, GroupId } = req.body;
    const [updated] = await MasterAccount.update(
      { name, openingAmount, closingAmount, GroupId },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    const fresh = await MasterAccount.findByPk(req.params.id);
    res.json(fresh);
  } catch (err) {
    next(err);
  }
};


// removes a master account.

exports.remove = async (req, res, next) => {
  try {
    const deleted = await MasterAccount.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
