const TransactionLine = require('../models/TransactionLine');

/**
 * Provides CRUD operations for individual transaction lines, using Sequelize’s TransactionLine model 
 * to manage debit/credit entries linked to transactions and accounts.
 * This file gets used a lot by the transaction controller to manage the lines of transactions.
 */

// Called to fetch and return all transaction lines across all transactions
exports.getAll = async (req, res, next) => {
  try {
    const lines = await TransactionLine.findAll();
    res.json(lines);
  } catch (err) {
    next(err);
  }
};

// Called to fetch and return a single transaction line by its ID
exports.getById = async (req, res, next) => {
  try {
    const line = await TransactionLine.findByPk(req.params.id);
    if (!line) return res.status(404).json({ message: 'Not found' });
    res.json(line);
  } catch (err) {
    next(err);
  }
};

// Creates a neew transaction line with specific debit, credit, and comment
// Links it to a transaction and a master account
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


// Updates an exisitng transaction line with specifc debit, credit, and 
// comment by its transaction id, account, or its id
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
