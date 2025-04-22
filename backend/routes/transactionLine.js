// backend/routes/transactionLine.js
const express = require('express');
const TransactionLine = require('../models/TransactionLine');

const router = express.Router();

// GET /api/transaction-lines
router.get('/', async (req, res) => {
  const all = await TransactionLine.findAll();
  res.json(all);
});

// GET /api/transaction-lines/:id
router.get('/:id', async (req, res) => {
  const line = await TransactionLine.findByPk(req.params.id);
  if (!line) return res.status(404).json({ message: 'Not found' });
  res.json(line);
});

// POST /api/transaction-lines
router.post('/', async (req, res) => {
  try {
    const {
      creditedAmount,
      debitedAmount,
      comment,
      TransactionId,
      MasterAccountId
    } = req.body;
    const created = await TransactionLine.create({
      creditedAmount,
      debitedAmount,
      comment,
      TransactionId,
      MasterAccountId
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/transaction-lines/:id
router.put('/:id', async (req, res) => {
  const {
    creditedAmount,
    debitedAmount,
    comment,
    TransactionId,
    MasterAccountId
  } = req.body;
  const [updated] = await TransactionLine.update(
    { creditedAmount, debitedAmount, comment, TransactionId, MasterAccountId },
    { where: { id: req.params.id } }
  );
  if (!updated) return res.status(404).json({ message: 'Not found' });
  const fresh = await TransactionLine.findByPk(req.params.id);
  res.json(fresh);
});

// DELETE /api/transaction-lines/:id
router.delete('/:id', async (req, res) => {
  const deleted = await TransactionLine.destroy({
    where: { id: req.params.id }
  });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).end();
});

module.exports = router;
