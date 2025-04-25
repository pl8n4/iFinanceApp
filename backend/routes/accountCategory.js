const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const controller = require('../controllers/accountCategoryController');
const router = express.Router();

// Protect all category routes
router.use(verifyToken);

// GET /api/categories
router.get('/', controller.getAll);
// GET /api/categories/:id
router.get('/:id', controller.getById);
// POST /api/categories
router.post('/', controller.create);
// PUT /api/categories/:id
router.put('/:id', controller.update);
// DELETE /api/categories/:id
router.delete('/:id', controller.remove);

module.exports = router;

