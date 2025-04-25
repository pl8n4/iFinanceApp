const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/reportController');
const router = express.Router();

router.use(verifyToken);

// POST /api/generate-report
router.post('/generate-report', ctrl.generateReport);

module.exports = router;