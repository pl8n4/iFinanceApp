const { Sequelize }       = require('sequelize');
const sequelize           = require('../db');
const Transaction         = require('../models/Transaction');
const TransactionLine     = require('../models/TransactionLine');

// List all transactions with their lines
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

// Fetch one transaction + lines
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

// Helper to validate debits == credits
function validateBalance(lines) {
  const totalDebit  = lines.reduce((s,l) => s + (l.debitedAmount  || 0), 0);
  const totalCredit = lines.reduce((s,l) => s + (l.creditedAmount || 0), 0);
  return totalDebit === totalCredit;
}

// Create a transaction + its lines in one call
exports.createFull = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const NonAdminUserId = req.user.id;
    const { date, description, lines } = req.body;

    if (!validateBalance(lines)) {
      throw new Error('Sum of debits must equal sum of credits');
    }

    // Create header
    const tx = await Transaction.create(
      { date, description, NonAdminUserId },
      { transaction: t }
    );

    // Create each detail line
    for (const line of lines) {
      await TransactionLine.create(
        { ...line, TransactionId: tx.id },
        { transaction: t }
      );
    }

    await t.commit();

    // Return the freshly-saved transaction
    const full = await Transaction.findByPk(tx.id, {
      include: [{ model: TransactionLine, as: 'lines' }]
    });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Update a transaction + its lines
exports.updateFull = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { date, description, lines } = req.body;
    const txId = req.params.id;

    if (!validateBalance(lines)) {
      throw new Error('Sum of debits must equal sum of credits');
    }

    // Update header
    const [updated] = await Transaction.update(
      { date, description },
      { where: { id: txId }, transaction: t }
    );
    if (!updated) throw new Error('Not found');

    // Fetch existing lines
    const existing = await TransactionLine.findAll({
      where: { TransactionId: txId },
      transaction: t
    });

    // Delete removed lines
    const incomingIds = lines.filter(l => l.id).map(l => l.id);
    for (const ex of existing) {
      if (!incomingIds.includes(ex.id)) {
        await TransactionLine.destroy({
          where: { id: ex.id },
          transaction: t
        });
      }
    }

    // Upsert incoming lines
    for (const line of lines) {
      if (line.id) {
        // Update
        await TransactionLine.update(
          { debitedAmount: line.debitedAmount,
            creditedAmount: line.creditedAmount,
            comment: line.comment,
            MasterAccountId: line.MasterAccountId
          },
          { where: { id: line.id }, transaction: t }
        );
      } else {
        // Create new
        await TransactionLine.create(
          { ...line, TransactionId: txId },
          { transaction: t }
        );
      }
    }

    await t.commit();

    // Return updated transaction
    const full = await Transaction.findByPk(txId, {
      include: [{ model: TransactionLine, as: 'lines' }]
    });
    res.json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Delete a transaction and its lines
exports.removeFull = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    // Remove detail lines first
    await TransactionLine.destroy({
      where: { TransactionId: req.params.id },
      transaction: t
    });
    // Then header
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
