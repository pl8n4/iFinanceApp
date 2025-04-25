const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/accountcategoryController');
const router = express.Router();

// Protect all category routes
router.use(verifyToken);

// GET /api/categories
router.get('/', ctrl.getAll);
// GET /api/categories/:id
router.get('/:id', ctrl.getById);
// POST /api/categories
router.post('/', ctrl.create);
// PUT /api/categories/:id
router.put('/:id', ctrl.update);
// DELETE /api/categories/:id
router.delete('/:id', ctrl.remove);

module.exports = router;