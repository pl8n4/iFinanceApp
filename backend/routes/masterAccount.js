const { verifyToken } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/masterAccountController');
const router = require('express').Router();
const transactionController = require('../controllers/transactionController');

router.use(verifyToken);

// GET /api/master-accounts
router.get('/', ctrl.getAll);
// GET /api/master-accounts/:id
router.get('/:id', ctrl.getById);
// POST /api/master-accounts
router.post('/', ctrl.create);
// PUT /api/master-accounts/:id
router.put('/:id', ctrl.update);
// DELETE /api/master-accounts/:id
router.delete('/:id', ctrl.remove);
// GET /api/master-accounts/:id/transactions
router.get('/:id/transactions', verifyToken, transactionController.getByAccount);

module.exports = router;
