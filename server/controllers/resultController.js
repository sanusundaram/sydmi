const Result = require('../models/Result');
const Quiz = require('../models/Quiz');

// POST /api/results — submit a quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (!quiz.isPublished) return res.status(400).json({ message: 'Quiz is not published' });

    let correctCount = 0;
    let scoreAccumulator = 0;
    const topicMap = {};
    const metacognition = {
      dunningKrugerCount: 0,
      imposterSyndromeCount: 0,
      dunningKrugerTopics: new Set(),
      imposterTopics: new Set()
    };

    const processedAnswers = quiz.questions.map((q, idx) => {
      const resp = answers[idx] || {};
      const selected = resp.selectedOption !== undefined ? resp.selectedOption : null;
      const isCorrect = selected === q.correctAnswer;
      const confidence = resp.confidence || 'medium';
      const usedHint = Boolean(resp.usedHint);
      
      let pointValue = 0;
      if (isCorrect) {
        correctCount++;
        pointValue = usedHint ? 0.75 : 1; // 25% penalty for hint
        scoreAccumulator += pointValue;

        // Imposter syndrome: right but low confidence
        if (confidence === 'low') {
          metacognition.imposterSyndromeCount++;
          metacognition.imposterTopics.add(q.topic);
        }
      } else {
        // Dunning-Kruger: wrong but high confidence
        if (confidence === 'high' && selected !== null) {
          metacognition.dunningKrugerCount++;
          metacognition.dunningKrugerTopics.add(q.topic);
        }
      }

      if (!topicMap[q.topic]) topicMap[q.topic] = { total: 0, score: 0, correct: 0 };
      topicMap[q.topic].total++;
      topicMap[q.topic].score += pointValue;
      if (isCorrect) topicMap[q.topic].correct++;

      return {
        questionId: q._id,
        selectedOption: selected,
        isCorrect,
        topic: q.topic,
        timeTaken: 0,
        confidence,
        usedHint
      };
    });

    const maxPossibleScore = quiz.questions.length;
    const score = Math.round((scoreAccumulator / maxPossibleScore) * 100);

    const skillGaps = Object.entries(topicMap).map(([topic, data]) => {
      const pct = Math.round((data.score / data.total) * 100);
      return {
        topic,
        totalQuestions: data.total,
        correctAnswers: data.correct,
        score: pct,
        strength: pct >= 75 ? 'strong' : pct >= 50 ? 'average' : 'weak',
      };
    });

    const result = await Result.create({
      student: req.user._id,
      quiz: quizId,
      answers: processedAnswers,
      score,
      totalQuestions: maxPossibleScore,
      correctAnswers: correctCount,
      timeTaken,
      skillGaps,
      metacognition: {
        dunningKrugerCount: metacognition.dunningKrugerCount,
        imposterSyndromeCount: metacognition.imposterSyndromeCount,
        dunningKrugerTopics: Array.from(metacognition.dunningKrugerTopics),
        imposterTopics: Array.from(metacognition.imposterTopics),
      },
      passed: score >= quiz.passingScore,
    });

    // Increment quiz attempts
    await Quiz.findByIdAndUpdate(quizId, { $inc: { attempts: 1 } });

    await result.populate('quiz', 'title subject passingScore');
    res.status(201).json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/results/me — student's own results
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title subject difficulty')
      .sort('-completedAt');
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/results/:id — single result
exports.getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('quiz')
      .populate('student', 'name email');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    if (req.user.role === 'student' && result.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/results/quiz/:quizId — teacher view all results for a quiz
exports.getQuizResults = async (req, res) => {
  try {
    const results = await Result.find({ quiz: req.params.quizId })
      .populate('student', 'name email department')
      .sort('-completedAt');
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/results/analytics/overview — teacher/admin analytics
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const filter = {};
    // Teachers only see results for their quizzes
    if (req.user.role === 'teacher') {
      const myQuizzes = await Quiz.find({ createdBy: req.user._id }).select('_id');
      filter.quiz = { $in: myQuizzes.map(q => q._id) };
    }
    const results = await Result.find(filter).populate('quiz', 'title subject').populate('student', 'name');
    const totalAttempts = results.length;
    const passing = results.filter(r => r.passed).length;
    const avgScore = totalAttempts > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalAttempts) : 0;

    // Aggregate skill gaps across all results
    const topicAgg = {};
    results.forEach(r => {
      r.skillGaps.forEach(sg => {
        if (!topicAgg[sg.topic]) topicAgg[sg.topic] = { total: 0, correct: 0 };
        topicAgg[sg.topic].total += sg.totalQuestions;
        topicAgg[sg.topic].correct += sg.correctAnswers;
      });
    });
    const topicStats = Object.entries(topicAgg).map(([topic, data]) => ({
      topic,
      score: Math.round((data.correct / data.total) * 100),
    }));

    res.json({ totalAttempts, passing, avgScore, topicStats, results: results.slice(0, 20) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
