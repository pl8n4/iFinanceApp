const { Sequelize } = require('sequelize');
const sequelize = require('../db');
const Transaction = require('../models/Transaction');
const TransactionLine = require('../models/TransactionLine');
const MasterAccount = require('../models/MasterAccount');  // ← NEW

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

    // 1) Create header
    const tx = await Transaction.create(
      { date, description, NonAdminUserId },
      { transaction: t }
    );

    // 2) Create each detail line and update account balances
    for (const ln of lines) {
      const createdLine = await TransactionLine.create(
        { ...ln, TransactionId: tx.id },
        { transaction: t }
      );

      // adjust the related MasterAccount.closingAmount
      const acct = await MasterAccount.findByPk(
        createdLine.MasterAccountId,
        { transaction: t }
      );
      const delta = parseFloat(createdLine.debitedAmount) - parseFloat(createdLine.creditedAmount);
      acct.closingAmount = (acct.closingAmount || 0) + delta;
      await acct.save({ transaction: t });
    }

    await t.commit();

    // 3) Return the freshly-saved transaction
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

    // 1) Update header
    const [updated] = await Transaction.update(
      { date, description },
      { where: { id: txId }, transaction: t }
    );
    if (!updated) throw new Error('Not found');

    // 2) Fetch existing lines
    const existing = await TransactionLine.findAll({
      where: { TransactionId: txId },
      transaction: t
    });

    // 3) Delete removed lines
    const incomingIds = lines.filter(l => l.id).map(l => l.id);
    for (const ex of existing) {
      if (!incomingIds.includes(ex.id)) {
        await TransactionLine.destroy({
          where: { id: ex.id },
          transaction: t
        });
      }
    }

    // 4) Upsert incoming lines
    for (const ln of lines) {
      if (ln.id) {
        // Update existing
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
        // Create new line
        const newLine = await TransactionLine.create(
          { ...ln, TransactionId: txId },
          { transaction: t }
        );

        // update account balance for the new line
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

    // 5) Return updated transaction
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
    // 1) Adjust balances back before deletion
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

    // 2) Remove detail lines
    await TransactionLine.destroy({
      where: { TransactionId: req.params.id },
      transaction: t
    });
    // 3) Then header
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

// Fetch all transactions for a given master account
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
