const { Sequelize } = require('sequelize');
const sequelize = require('../db');
const Transaction = require('../models/Transaction');
const TransactionLine = require('../models/TransactionLine');
const MasterAccount = require('../models/MasterAccount');

/**
 * Provides endpoints for full CRUD on Transactions and their lines for the authenticated user,
 * using Sequelize transactions to ensure double-entry bookkeeping integrity.
 */

// Lists all transactions along with their detail lines in descending order by date
exports.getAllFull = async (req, res, next) => {
  try {
    const txs = await Transaction.findAll({
      include: [{ model: TransactionLine, as: 'lines' }],
      order: [['date','DESC']]
    });
    res.json(txs);
  } catch (err) {
    next(err);
  }
};

// Fetches a single transaction by its ID, including its detail lines
exports.getByIdFull = async (req, res, next) => {
  try {
    const tx = await Transaction.findByPk(req.params.id, {
      include: [{ model: TransactionLine, as: 'lines' }]
    });
    if (!tx) return res.status(404).json({ message: 'Not found' });
    res.json(tx);
  } catch (err) {
    next(err);
  }
};

// Helper to ensure total debit rquals total credit in a set of lines
function validateBalance(lines) {
  const totalDebit  = lines.reduce((s,l) => s + (l.debitedAmount  || 0), 0);
  const totalCredit = lines.reduce((s,l) => s + (l.creditedAmount || 0), 0);
  return totalDebit === totalCredit;
}

// Creates a new transaction with its detail lines, adjusting account balances accordingly
exports.createFull = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const NonAdminUserId = req.user.id;
    const { date, description, lines } = req.body;

    if (!validateBalance(lines)) {
      throw new Error('Sum of debits must equal sum of credits');
    }
    // Create the transaction header
    const tx = await Transaction.create(
      { date, description, NonAdminUserId },
      { transaction: t }
    );
    // Create the detail lines
    for (const ln of lines) {
      const createdLine = await TransactionLine.create(
        { ...ln, TransactionId: tx.id },
        { transaction: t }
      );

      const acct = await MasterAccount.findByPk(
        createdLine.MasterAccountId,
        { transaction: t }
      );
      const delta = parseFloat(createdLine.debitedAmount) - parseFloat(createdLine.creditedAmount);
      acct.closingAmount = (acct.closingAmount || 0) + delta;
      await acct.save({ transaction: t });
    }

    await t.commit();

    // Return the full transaction with lines
    const full = await Transaction.findByPk(tx.id, {
      include: [{ model: TransactionLine, as: 'lines' }]
    });
    res.status(201).json(full);

  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Updates an existing transaction and its detail lines, adjusting account balances accordingly
exports.updateFull = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { date, description, lines } = req.body;
    const txId = req.params.id;

    if (!validateBalance(lines)) {
      throw new Error('Sum of debits must equal sum of credits');
    }

    // Update transaction header
    const [updated] = await Transaction.update(
      { date, description },
      { where: { id: txId }, transaction: t }
    );
    if (!updated) throw new Error('Not found');

    // Fetch existing lines for compasrison
    const existing = await TransactionLine.findAll({
      where: { TransactionId: txId },
      transaction: t
    });

    // Delete lines that were removed by the user
    const incomingIds = lines.filter(l => l.id).map(l => l.id);
    for (const ex of existing) {
      if (!incomingIds.includes(ex.id)) {
        await TransactionLine.destroy({
          where: { id: ex.id },
          transaction: t
        });
      }
    }

    // 4) Upsert incoming lines (update or create), adjusting account balances for new lines
    for (const ln of lines) {
      if (ln.id) {
        await TransactionLine.update(
          {
            debitedAmount:  ln.debitedAmount,
            creditedAmount: ln.creditedAmount,
            comment:        ln.comment,
            MasterAccountId: ln.MasterAccountId
          },
          { where: { id: ln.id }, transaction: t }
        );
      } else {
        const newLine = await TransactionLine.create(
          { ...ln, TransactionId: txId },
          { transaction: t }
        );

        const acct = await MasterAccount.findByPk(
          newLine.MasterAccountId,
          { transaction: t }
        );
        const delta = parseFloat(newLine.debitedAmount) - parseFloat(newLine.creditedAmount);
        acct.closingAmount = (acct.closingAmount || 0) + delta;
        await acct.save({ transaction: t });
      }
    }

    await t.commit();

    // Return updated transaction with lines
    const full = await Transaction.findByPk(txId, {
      include: [{ model: TransactionLine, as: 'lines' }]
    });
    res.json(full);

  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Deletes a transaction and its detail lines, adjusting account balances accordingly
exports.removeFull = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    // Revere all line impacts on account balances
    const lines = await TransactionLine.findAll({
      where: { TransactionId: req.params.id },
      transaction: t
    });
    for (const ln of lines) {
      const acct = await MasterAccount.findByPk(ln.MasterAccountId, { transaction: t });
      const delta = parseFloat(ln.creditedAmount) - parseFloat(ln.debitedAmount);
      acct.closingAmount = (acct.closingAmount || 0) + delta;
      await acct.save({ transaction: t });
    }

    // Remove detail lines
    await TransactionLine.destroy({
      where: { TransactionId: req.params.id },
      transaction: t
    });
    // Deletes the transaction header
    const deleted = await Transaction.destroy({
      where: { id: req.params.id },
      transaction: t
    });
    if (!deleted) throw new Error('Not found');

    await t.commit();
    res.status(204).end();

  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Fetches all transaction lines for a specific master account ID
exports.getByAccount = async (req, res, next) => {
  try {
    const lines = await TransactionLine.findAll({
      where: { MasterAccountId: req.params.id },
      include: [{ model: Transaction, as: 'Transaction' }]
    });
    res.json(lines);
  } catch (err) {
    next(err);
  }
};
