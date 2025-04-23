const express = require('express');
const AccountCategory = require('../models/AccountCategory');
const { Op } = require('sequelize');

const router = express.Router();



// GET /api/categories
// Fetches all account categories from the database in JSON
router.get('/', async (req, res) => {
    const all = await AccountCategory.findAll();
    res.json(all);
});

// GET /api/categories/:id
// Fetches a single category by its ID
router.get('/:id', async (req, res) => {
    const cat = await AccountCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({message: 'Not found' });
    res.json(cat);
});

// POST /api/categories
// Creates a new account category based on provided fields
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
// Updates an existing category by its ID with provided fields
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
// Deletes an account category by its ID.
router.delete('/:id', async (req, res) => {
    const deleted = await AccountCategory.destroy({
        where: { id: req.params.id }
    });
    if (!deleted) return res.status(404).json({message: 'Not found'});
    res.status(204).end();
});

module.exports = router;