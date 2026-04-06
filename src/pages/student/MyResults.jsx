import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/me')
      .then(res => setResults(res.data.results))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Performance</h1>
        <p className="page-subtitle">Track your quiz history and see your progress.</p>
      </div>

      {loading ? (
        <div className="spinner mx-auto mt-10" />
      ) : results.length === 0 ? (
        <div className="empty-state glass-card mt-10">
          <div className="empty-icon">📊</div>
          <h3 className="empty-title">No Results Yet</h3>
          <p className="empty-desc">Take a quiz to see your performance and skill gap analysis here.</p>
          <Link to="/quizzes" className="btn btn-primary mt-4">Browse Quizzes</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Quiz</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r._id}>
                  <td>{new Date(r.completedAt).toLocaleDateString()}</td>
                  <td className="font-semibold">{r.quiz?.title || 'Deleted Quiz'}</td>
                  <td>{r.quiz?.subject}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{r.score}%</span>
                      <div className="w-24 bg-surface-3 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all" 
                          style={{ width: `${r.score}%`, background: r.passed ? 'var(--success)' : 'var(--danger)' }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    {r.passed ? (
                      <span className="badge badge-success">Passed</span>
                    ) : (
                      <span className="badge badge-danger">Failed</span>
                    )}
                  </td>
                  <td>
                    <Link to={`/results/${r._id}`} className="btn btn-secondary btn-sm">Analysis</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
