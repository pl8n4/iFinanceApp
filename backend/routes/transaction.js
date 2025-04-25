const express        = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const ctrl           = require('../controllers/transactionController');
const router         = express.Router();

router.use(verifyToken);

// GET /api/transactions
router.get('/',       ctrl.getAllFull);
// GET /api/transactions/:id
router.get('/:id',    ctrl.getByIdFull);
// POST /api/transactions
router.post('/',      ctrl.createFull);
// PUT /api/transactions/:id
router.put('/:id',    ctrl.updateFull);
// DELETE /api/transactions/:id
router.delete('/:id', ctrl.removeFull);


module.exports = router;
