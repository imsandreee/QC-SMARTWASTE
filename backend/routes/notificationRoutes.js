const express = require('express');
const router = express.Router();
const { getAll, sendManual, getMine } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin'), getAll);
router.post('/send', authorize('admin'), sendManual);
router.get('/my', getMine);

module.exports = router;
