import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes')
      .then(res => setQuizzes(res.data.quizzes))
      .catch(() => toast.error('Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Available Quizzes</h1>
        <p className="page-subtitle">Test your knowledge and discover your skill gaps.</p>
      </div>

      {loading ? (
        <div className="spinner mx-auto mt-10" />
      ) : quizzes.length === 0 ? (
        <div className="empty-state glass-card mt-10">
          <div className="empty-icon">📭</div>
          <h3 className="empty-title">No Quizzes Available</h3>
          <p className="empty-desc">Check back later for new assessments from your teachers.</p>
        </div>
      ) : (
        <div className="grid-3">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="glass-card flex-col flex" style={{ padding: '24px' }}>
              <div className="flex justify-between items-start mb-4">
                <span className="badge badge-primary">{quiz.subject}</span>
                <span className="badge badge-info">{quiz.difficulty}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
              <p className="text-sm text-muted mb-6 flex-1 line-clamp-2">{quiz.description}</p>
              
              <div className="flex items-center justify-between text-sm text-muted mb-6">
                <div className="flex items-center gap-2">
                  <span>⏱️</span> {quiz.timeLimit} mins
                </div>
                <div className="flex items-center gap-2">
                  <span>📝</span> {quiz.questions.length} Qs
                </div>
              </div>

              <Link to={`/quiz/${quiz._id}`} className="btn btn-primary w-full justify-center">
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
