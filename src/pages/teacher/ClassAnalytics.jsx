import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClassAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/analytics/overview')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="spinner mx-auto mt-20" /></div>;
  if (!data) return null;

  return (
    <div className="page">
      <div className="page-header mb-8">
        <h1 className="page-title">Class Analytics</h1>
        <p className="page-subtitle">Identify skill gaps and monitor student progress across all your quizzes.</p>
      </div>

      <div className="grid-3 mb-8">
         <div className="stat-card">
          <div className="stat-label">Total Submissions</div>
          <div className="stat-value mt-2">{data.totalAttempts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pass Rate</div>
          <div className="stat-value mt-2 text-info">
            {data.totalAttempts > 0 ? Math.round((data.passing / data.totalAttempts) * 100) : 0}%
          </div>
          <div className="text-sm mt-1">{data.passing} / {data.totalAttempts} passed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Global Average Score</div>
          <div className={`stat-value mt-2 ${data.avgScore >= 60 ? 'text-success' : 'text-danger'}`}>
            {data.avgScore}%
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Class Performance by Topic</h3>
        <p className="text-sm text-muted mb-6">Aggregated average score for every topic tested across all quizzes. Identify which concepts need reteaching.</p>
        
        {data.topicStats.length === 0 ? (
           <div className="text-center text-muted p-10">No topic data available yet. Wait for students to take quizzes.</div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer>
              <BarChart data={data.topicStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="topic" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip cursor={{ fill: 'var(--glass)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                <Bar dataKey="score" name="Average Score %" radius={[4, 4, 0, 0]}>
                   {data.topicStats.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.score >= 70 ? 'var(--success)' : entry.score >= 50 ? 'var(--warning)' : 'var(--danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg mb-4">Recent Submissions</h3>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(r => (
              <tr key={r._id}>
                <td>{new Date(r.completedAt).toLocaleDateString()}</td>
                <td className="font-semibold">{r.student?.name || 'Unknown'}</td>
                <td>{r.quiz?.title}</td>
                <td className="font-bold">{r.score}%</td>
                <td>
                  <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>
                    {r.passed ? 'Pass' : 'Fail'}
                  </span>
                </td>
              </tr>
            ))}
            {data.results.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted py-6">No submissions recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
