const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const userCtrl = require('../controllers/userController');

// All endpoints use verifyToken; controller enforces admin-only where needed
router.post('/', verifyToken, userCtrl.createUser);
router.get('/', verifyToken, userCtrl.getAllUsers);
router.get('/:id', verifyToken, userCtrl.getUserById);
router.put('/:id', verifyToken, userCtrl.updateUser);
router.delete('/:id', verifyToken, userCtrl.deleteUser);

module.exports = router;
