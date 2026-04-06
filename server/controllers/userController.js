const User = require('../models/User');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort('-createdAt');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/stats — admin stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const teachers = await User.countDocuments({ role: 'teacher' });
    const admins = await User.countDocuments({ role: 'admin' });
    const totalQuizzes = await Quiz.countDocuments();
    const totalResults = await Result.countDocuments();
    const publishedQuizzes = await Quiz.countDocuments({ isPublished: true });
    res.json({ totalUsers, students, teachers, admins, totalQuizzes, totalResults, publishedQuizzes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
