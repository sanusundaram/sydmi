const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// GET /api/quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.isPublished = true;
    else if (req.user.role === 'teacher') filter.createdBy = req.user._id;

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name email')
      .select('-questions.correctAnswer')
      .sort('-createdAt');
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quizzes/:id
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name email');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // Students can't see correct answers before submitting
    if (req.user.role === 'student') {
      const sanitized = quiz.toObject();
      sanitized.questions = sanitized.questions.map(q => {
        const { correctAnswer, explanation, ...rest } = q;
        return rest;
      });
      return res.json({ quiz: sanitized });
    }
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quizzes
exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ quiz });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }
    Object.assign(quiz, req.body);
    await quiz.save();
    res.json({ quiz });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quizzes/all (admin)
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).populate('createdBy', 'name email').sort('-createdAt');
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quizzes/generate-remedial
exports.generateRemedialQuiz = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id });
    if (!results || results.length === 0) {
      return res.status(400).json({ message: "Take at least one quiz first!" });
    }

    const wrongQuestionIds = new Set();
    results.forEach(r => {
      r.answers.forEach(a => {
        if (!a.isCorrect && a.questionId) {
          wrongQuestionIds.add(a.questionId.toString());
        }
      });
    });

    if (wrongQuestionIds.size === 0) {
      return res.status(400).json({ message: "No incorrect answers found to build a review quiz!" });
    }

    const idsArray = Array.from(wrongQuestionIds);
    const quizzes = await Quiz.find({ 'questions._id': { $in: idsArray } });
    let remedialQuestions = [];
    
    quizzes.forEach(q => {
      q.questions.forEach(question => {
        if (idsArray.includes(question._id.toString())) {
          remedialQuestions.push(question);
        }
      });
    });

    if (remedialQuestions.length > 20) {
      remedialQuestions = remedialQuestions.sort(() => 0.5 - Math.random()).slice(0, 20);
    }

    const remedialQuiz = await Quiz.create({
      title: `Remedial Quiz: ${new Date().toLocaleDateString()}`,
      subject: 'Review & Reinforce',
      description: 'Auto-generated quiz specifically targeting concepts you missed previously.',
      timeLimit: 30,
      createdBy: req.user._id,
      isPublished: true,
      isRemedial: true,
      questions: remedialQuestions
    });

    res.json({ quizId: remedialQuiz._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
