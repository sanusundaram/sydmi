const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUser, updateUser, deleteUser, getStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
