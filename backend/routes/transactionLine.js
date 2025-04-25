const express        = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const ctrl           = require('../controllers/transactionLineController');

const router = express.Router();

router.use(verifyToken);

// GET /api/transaction-lines
router.get('/', ctrl.getAll);
// GET /api/transaction-lines/:id
router.get('/:id', ctrl.getById);
// POST /api/transaction-lines
router.post('/', ctrl.create);
// PUT /api/transaction-lines/:id
router.put('/:id', ctrl.update);
// DELETE /api/transaction-lines/:id
router.delete('/:id', ctrl.remove);

module.exports = router;
