const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser, getBarangays, getCollectors } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/barangays', getBarangays);
router.get('/collectors', getCollectors);
router.get('/', authorize('admin'), getAllUsers);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
