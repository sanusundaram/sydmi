const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  topic: { type: String, default: 'General' },
  explanation: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  hint: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  description: { type: String, default: '' },
  topics: [{ type: String }],
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 }, // in minutes
  passingScore: { type: Number, default: 60 }, // percentage
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  isRemedial: { type: Boolean, default: false },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

quizSchema.pre('save', function () {
  this.updatedAt = Date.now();
  // Auto-extract topics from questions
  const topicsSet = new Set(this.questions.map(q => q.topic));
  this.topics = Array.from(topicsSet);
});

module.exports = mongoose.model('Quiz', quizSchema);
