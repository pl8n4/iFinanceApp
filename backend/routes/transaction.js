// backend/routes/transaction.js
const express     = require('express');
const Transaction = require('../models/Transaction');

const router = express.Router();

// GET /api/transactions
// Fetches all transactions from the database in JSON
router.get('/', async (req, res) => {
  const all = await Transaction.findAll();
  res.json(all);
});

// GET /api/transactions/:id
// Fetches a single transaction by its ID
router.get('/:id', async (req, res) => {
  const tx = await Transaction.findByPk(req.params.id);
  if (!tx) return res.status(404).json({ message: 'Not found' });
  res.json(tx);
});

// POST /api/transactions
// Creates a new transaction based on provided fields
router.post('/', async (req, res) => {
  try {
    const { date, description, NonAdminUserId } = req.body;
    const created = await Transaction.create({
      date,
      description,
      NonAdminUserId
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/transactions/:id
// Updates an existing transaction by its ID with provided fields
router.put('/:id', async (req, res) => {
  const { date, description, NonAdminUserId } = req.body;
  const [updated] = await Transaction.update(
    { date, description, NonAdminUserId },
    { where: { id: req.params.id } }
  );
  if (!updated) return res.status(404).json({ message: 'Not found' });
  const fresh = await Transaction.findByPk(req.params.id);
  res.json(fresh);
});

// DELETE /api/transactions/:id
// Deletes a transaction by its ID
router.delete('/:id', async (req, res) => {
  const deleted = await Transaction.destroy({ where: { id: req.params.id } });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).end();
});

module.exports = router;
