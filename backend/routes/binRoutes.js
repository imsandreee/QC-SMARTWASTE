const express = require('express');
const router = express.Router();
const { getAllBins, getBinById, createBin, updateBin, deleteBin, getStats, markCollected } = require('../controllers/binController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats/summary', getStats);
router.get('/', getAllBins);
router.get('/:id', getBinById);
router.post('/', authorize('admin'), createBin);
router.put('/:id', authorize('admin'), updateBin);
router.delete('/:id', authorize('admin'), deleteBin);
router.post('/:id/collect', authorize('admin', 'collector'), markCollected);

module.exports = router;
