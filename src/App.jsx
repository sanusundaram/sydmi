import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizList from './pages/student/QuizList';
import TakeQuiz from './pages/student/TakeQuiz';
import MyResults from './pages/student/MyResults';
import ResultDetail from './pages/student/ResultDetail';
import ManageQuizzes from './pages/teacher/ManageQuizzes';
import QuizBuilder from './pages/teacher/QuizBuilder';
import ClassAnalytics from './pages/teacher/ClassAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOverview from './pages/admin/AdminOverview';
import AppShell from './components/layout/AppShell';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        {/* Student routes */}
        <Route path="quizzes" element={<ProtectedRoute roles={['student']}><QuizList /></ProtectedRoute>} />
        <Route path="quiz/:id" element={<ProtectedRoute roles={['student']}><TakeQuiz /></ProtectedRoute>} />
        <Route path="results" element={<ProtectedRoute roles={['student']}><MyResults /></ProtectedRoute>} />
        <Route path="results/:id" element={<ProtectedRoute roles={['student', 'teacher', 'admin']}><ResultDetail /></ProtectedRoute>} />
        {/* Teacher routes */}
        <Route path="manage/quizzes" element={<ProtectedRoute roles={['teacher', 'admin']}><ManageQuizzes /></ProtectedRoute>} />
        <Route path="manage/quizzes/create" element={<ProtectedRoute roles={['teacher', 'admin']}><QuizBuilder /></ProtectedRoute>} />
        <Route path="manage/quizzes/:id/edit" element={<ProtectedRoute roles={['teacher', 'admin']}><QuizBuilder /></ProtectedRoute>} />
        <Route path="manage/analytics" element={<ProtectedRoute roles={['teacher', 'admin']}><ClassAnalytics /></ProtectedRoute>} />
        {/* Admin routes */}
        <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="admin/overview" element={<ProtectedRoute roles={['admin']}><AdminOverview /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
