const express = require('express');
const router = express.Router();
const {
  submitQuiz, getMyResults, getResult, getQuizResults, getAnalyticsOverview,
} = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('student'), submitQuiz);
router.get('/me', authorize('student'), getMyResults);
router.get('/analytics/overview', authorize('teacher', 'admin'), getAnalyticsOverview);
router.get('/quiz/:quizId', authorize('teacher', 'admin'), getQuizResults);
router.get('/:id', getResult);

module.exports = router;
