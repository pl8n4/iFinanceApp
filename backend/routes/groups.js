// backend/routes/group.js
const express = require('express');
const Group = require('../models/Group');

const router = express.Router();

// GET /api/groups
router.get('/', async (req, res) => {
  const all = await Group.findAll();
  res.json(all);
});

// GET /api/groups/:id
router.get('/:id', async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) return res.status(404).json({ message: 'Not found' });
  res.json(group);
});

// POST /api/groups
router.post('/', async (req, res) => {
  try {
    const { name, AccountCategoryId, parentId } = req.body;
    const created = await Group.create({ name, AccountCategoryId, parentId });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/groups/:id
router.put('/:id', async (req, res) => {
  const { name, AccountCategoryId, parentId } = req.body;
  const [updated] = await Group.update(
    { name, AccountCategoryId, parentId },
    { where: { id: req.params.id } }
  );
  if (!updated) return res.status(404).json({ message: 'Not found' });
  const fresh = await Group.findByPk(req.params.id);
  res.json(fresh);
});

// DELETE /api/groups/:id
router.delete('/:id', async (req, res) => {
  const deleted = await Group.destroy({ where: { id: req.params.id } });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).end();
});

module.exports = router;
