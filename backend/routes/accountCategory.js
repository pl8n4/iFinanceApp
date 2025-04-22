const express = require('express');
const AccountCategory = require('../models/AccountCategory');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    const all = await AccountCategory.findAll();
    res.json(all);
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
    const cat = await AccountCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({message: 'Not found' });
    res.json(cat);
});

// POST /api/categories
router.post('/', async (req, res) => {
    try {
        const { name, type } = req.body;
        const created =await AccountCategory.create({ name, type });
        res.status(201).json(created);
    } catch (error) {
        res.setMaxListeners(400).json({message: error.message});
    } 
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
    const {  name, type } = req.body;
    const [updated] = await AccountCategory.update(
        {name, type},
        { where: {id: req.params.id}}
    );
    if (!updated) return res.status(404).json({message: 'Not found'});
    const fresh = await AccountCategory.findByPk(req.params.id);
    res.json(fresh);
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    const deleted = await AccountCategory.destroy({
        where: { id: req.params.id }
    });
    if (!deleted) return res.status(404).json({message: 'Not found'});
    res.status(204).end();
});

module.exports = router;