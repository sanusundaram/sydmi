import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalTaken: 0, avgScore: 0, recentResults: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/results/me')
      .then(res => {
        const results = res.data.results;
        const totalTaken = results.length;
        const avgScore = totalTaken > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalTaken) : 0;
        setStats({ totalTaken, avgScore, recentResults: results.slice(0, 3) });
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateRemedial = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/quizzes/generate-remedial');
      toast.success("Review Quiz generated!");
      navigate(`/quiz/${res.data.quizId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't generate review quiz");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="spinner mx-auto mt-10" />;

  return (
    <>
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-500" style={{ background: 'var(--surface-2)', color: 'var(--info)' }}>📊</div>
          <div className="stat-value">{stats.totalTaken}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-500" style={{ background: 'var(--surface-2)', color: 'var(--success)' }}>🏆</div>
          <div className="stat-value">{stats.avgScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-500" style={{ background: 'var(--surface-2)', color: 'var(--primary)' }}>🎯</div>
          <div className="stat-value">{stats.totalTaken > 0 ? stats.recentResults[0]?.skillGaps?.filter(g => g.strength === 'weak').length || 0 : 0}</div>
          <div className="stat-label">Skill Gaps to Review</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Quizzes</h3>
            <Link to="/results" className="text-primary text-sm font-semibold">View All</Link>
          </div>
          {stats.recentResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p className="text-muted">No quizzes taken yet.</p>
              <Link to="/quizzes" className="btn btn-primary btn-sm mt-2">Browse Quizzes</Link>
            </div>
          ) : (
            <div className="flex-col gap-3">
              {stats.recentResults.map(r => (
                <div key={r._id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2 transition hover:border-border-hover">
                  <div>
                    <div className="font-semibold">{r.quiz?.title || 'Unknown Quiz'}</div>
                    <div className="text-xs text-muted mt-1">{new Date(r.completedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>
                      {r.score}%
                    </span>
                    <Link to={`/results/${r._id}`} className="btn btn-ghost btn-sm">Details →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 flex-col justify-center items-center text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="font-bold text-xl mb-2">Ready for a challenge?</h3>
          <p className="text-muted text-sm mb-6 max-w-sm">Take a new quiz to discover your strengths and identify areas for improvement, or generate a custom review based on your past mistakes.</p>
          <div className="flex gap-4">
            <Link to="/quizzes" className="btn btn-primary">Browse Quizzes</Link>
            <button 
              onClick={handleGenerateRemedial} 
              disabled={generating || stats.totalTaken === 0} 
              className="btn btn-secondary border-primary text-primary hover:bg-primary hover:text-white"
            >
              {generating ? 'Compiling...' : 'Auto-Generate Review Quiz'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
