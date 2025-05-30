const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public login
router.post('/login', authCtrl.login);


router.post('/change-password', verifyToken, authCtrl.changePassword);

module.exports = router;
