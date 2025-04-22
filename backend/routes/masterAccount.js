// backend/routes/masterAccount.js
const express = require('express');
const MasterAccount = require('../models/MasterAccount');

const router = express.Router();

// GET /api/master-accounts
router.get('/', async (req, res) => {
  const all = await MasterAccount.findAll();
  res.json(all);
});

// GET /api/master-accounts/:id
router.get('/:id', async (req, res) => {
  const acct = await MasterAccount.findByPk(req.params.id);
  if (!acct) return res.status(404).json({ message: 'Not found' });
  res.json(acct);
});

// POST /api/master-accounts
router.post('/', async (req, res) => {
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
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/master-accounts/:id
router.put('/:id', async (req, res) => {
  const { name, openingAmount, closingAmount, GroupId } = req.body;
  const [updated] = await MasterAccount.update(
    { name, openingAmount, closingAmount, GroupId },
    { where: { id: req.params.id } }
  );
  if (!updated) return res.status(404).json({ message: 'Not found' });
  const fresh = await MasterAccount.findByPk(req.params.id);
  res.json(fresh);
});

// DELETE /api/master-accounts/:id
router.delete('/:id', async (req, res) => {
  const deleted = await MasterAccount.destroy({
    where: { id: req.params.id }
  });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).end();
});

module.exports = router;
