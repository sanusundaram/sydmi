import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentDashboard from './student/StudentDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import AdminDashboard from './admin/AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="page dashboard-page">
      <div className="page-header mb-6">
        <h1 className="page-title">Welcome, {user.name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here is your {user.role} overview.</p>
      </div>

      {user.role === 'student' && <StudentDashboard />}
      {user.role === 'teacher' && <TeacherDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
}
