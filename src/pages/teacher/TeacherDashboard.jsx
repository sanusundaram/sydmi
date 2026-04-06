import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ totalQuizzes: 0, totalAttempts: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/quizzes'),
      api.get('/results/analytics/overview')
    ])
      .then(([qRes, oRes]) => {
        setStats({
          totalQuizzes: qRes.data.quizzes.length,
          totalAttempts: oRes.data.totalAttempts,
          avgScore: oRes.data.avgScore,
        });
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner mx-auto mt-10" />;

  return (
    <>
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)' }}>📝</div>
          <div className="stat-value">{stats.totalQuizzes}</div>
          <div className="stat-label">My Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>👥</div>
          <div className="stat-value">{stats.totalAttempts}</div>
          <div className="stat-label">Total Student Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>📈</div>
          <div className="stat-value">{stats.avgScore}%</div>
          <div className="stat-label">Class Average Score</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card p-6 flex-col justify-center items-center text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="font-bold text-xl mb-2">Create a New Quiz</h3>
          <p className="text-muted text-sm mb-6 max-w-sm">Design assignments and evaluate your students effectively.</p>
          <Link to="/manage/quizzes/create" className="btn btn-primary">Create Quiz</Link>
        </div>

        <div className="glass-card p-6 flex-col justify-center items-center text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-bold text-xl mb-2">Deep Dive Analytics</h3>
          <p className="text-muted text-sm mb-6 max-w-sm">Analyze class-wide skill gaps and identify struggling topics.</p>
          <Link to="/manage/analytics" className="btn btn-secondary">View Analytics</Link>
        </div>
      </div>
    </>
  );
}
