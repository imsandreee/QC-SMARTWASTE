const express = require('express');
const router = express.Router();
const { getAll, create, updateStatus, getCollections } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/collections', getCollections);
router.get('/', getAll);
router.post('/', authorize('citizen', 'admin'), create);
router.put('/:id/status', authorize('admin', 'collector'), updateStatus);

module.exports = router;
