const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  selectedOption: { type: Number }, // null if skipped
  isCorrect: { type: Boolean },
  topic: { type: String },
  timeTaken: { type: Number, default: 0 }, // seconds
  confidence: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  usedHint: { type: Boolean, default: false },
});

const skillGapSchema = new mongoose.Schema({
  topic: { type: String },
  totalQuestions: { type: Number },
  correctAnswers: { type: Number },
  score: { type: Number }, // percentage
  strength: { type: String, enum: ['weak', 'average', 'strong'] },
});

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [answerSchema],
  score: { type: Number, required: true }, // percentage
  totalQuestions: { type: Number },
  correctAnswers: { type: Number },
  timeTaken: { type: Number }, // seconds
  skillGaps: [skillGapSchema],
  metacognition: {
    dunningKrugerCount: { type: Number, default: 0 },
    imposterSyndromeCount: { type: Number, default: 0 },
    dunningKrugerTopics: [{ type: String }],
    imposterTopics: [{ type: String }]
  },
  passed: { type: Boolean },
  completedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Result', resultSchema);
