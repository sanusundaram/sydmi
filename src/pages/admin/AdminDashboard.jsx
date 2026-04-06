import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load system stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner mx-auto mt-10" />;
  if (!stats) return null;

  return (
    <>
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-500" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)' }}>👥</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-500" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>🎓</div>
          <div className="stat-value">{stats.students}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-pink-100 text-pink-500" style={{ background: 'rgba(255,107,157,0.15)', color: 'var(--accent)' }}>👩‍🏫</div>
          <div className="stat-value">{stats.teachers}</div>
          <div className="stat-label">Teachers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange-100 text-orange-500" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>⚙️</div>
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">Admins</div>
        </div>
      </div>

      <div className="grid-3 mb-6">
         <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-500" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>📝</div>
          <div className="stat-value">{stats.totalQuizzes}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-500" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>🚀</div>
          <div className="stat-value">{stats.publishedQuizzes}</div>
          <div className="stat-label">Published Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-500" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>📊</div>
          <div className="stat-value">{stats.totalResults}</div>
          <div className="stat-label">Total Quiz Submissions</div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
        <Link to="/admin/overview" className="btn btn-secondary">Detailed System Overview</Link>
      </div>
    </>
  );
}
