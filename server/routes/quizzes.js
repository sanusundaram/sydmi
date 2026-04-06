const express = require('express');
const router = express.Router();
const { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, getAllQuizzes, generateRemedialQuiz } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/all', authorize('admin'), getAllQuizzes);
router.post('/generate-remedial', authorize('student'), generateRemedialQuiz);

router.route('/')
  .get(getQuizzes)
  .post(authorize('teacher', 'admin'), createQuiz);

router.route('/:id')
  .get(getQuiz)
  .put(authorize('teacher', 'admin'), updateQuiz)
  .delete(authorize('teacher', 'admin'), deleteQuiz);

module.exports = router;
