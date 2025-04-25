const { verifyToken } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/masterAccountController');
const router = require('express').Router();

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

module.exports = router;
