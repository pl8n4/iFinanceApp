const express = require('express');
const { verifyToken } = require('../authMiddleware');
const ctrl = require('../controllers/groupController');
const router = express.Router();

// Protect all group routes
router.use(verifyToken);

// GET /api/groups
router.get('/', ctrl.getAll);
// GET /api/groups/:id
router.get('/:id', ctrl.getById);
// POST /api/groups
router.post('/', trl.create);
// PUT /api/groups/:id
router.put('/:id', ctrl.update);
// DELETE /api/groups/:id
router.delete('/:id', ctrl.remove);

module.exports = router;
