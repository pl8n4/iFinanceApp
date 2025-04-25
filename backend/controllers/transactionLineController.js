const TransactionLine = require('../models/TransactionLine');

// Fetches all debit/credit transaction lines
exports.getAll = async (req, res, next) => {
  try {
    const lines = await TransactionLine.findAll();
    res.json(lines);
  } catch (err) {
    next(err);
  }
};

// Fetches a single transaction line by its ID
exports.getById = async (req, res, next) => {
  try {
    const line = await TransactionLine.findByPk(req.params.id);
    if (!line) return res.status(404).json({ message: 'Not found' });
    res.json(line);
  } catch (err) {
    next(err);
  }
};


// Creates a new transaction line
// Expects { creditedAmount, debitedAmount, comment, TransactionId, MasterAccountId }
exports.create = async (req, res, next) => {
  try {
    const { creditedAmount, debitedAmount, comment, TransactionId, MasterAccountId } = req.body;
    const created = await TransactionLine.create({
      creditedAmount,
      debitedAmount,
      comment,
      TransactionId,
      MasterAccountId
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};


// Updates an existing transaction line
// Expects { creditedAmount, debitedAmount, comment, TransactionId, MasterAccountId }
exports.update = async (req, res, next) => {
  try {
    const { creditedAmount, debitedAmount, comment, TransactionId, MasterAccountId } = req.body;
    const [updated] = await TransactionLine.update(
      { creditedAmount, debitedAmount, comment, TransactionId, MasterAccountId },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    const fresh = await TransactionLine.findByPk(req.params.id);
    res.json(fresh);
  } catch (err) {
    next(err);
  }
};

// Removes a transaction line by its ID
exports.remove = async (req, res, next) => {
  try {
    const deleted = await TransactionLine.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
