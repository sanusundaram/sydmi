import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './AppShell.css';

const studentNav = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/quizzes', label: 'Browse Quizzes', icon: '📚' },
  { path: '/results', label: 'My Results', icon: '📊' },
];

const teacherNav = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/manage/quizzes', label: 'Manage Quizzes', icon: '📝' },
  { path: '/manage/analytics', label: 'Class Analytics', icon: '📈' },
];

const adminNav = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/admin/overview', label: 'System Overview', icon: '⚡' },
  { path: '/admin/users', label: 'User Management', icon: '👥' },
  { path: '/manage/quizzes', label: 'All Quizzes', icon: '📝' },
  { path: '/manage/analytics', label: 'Analytics', icon: '📈' },
];

const navByRole = { student: studentNav, teacher: teacherNav, admin: adminNav };

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = navByRole[user?.role] || studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = { student: '#004643', teacher: '#F9BC60', admin: '#3b5a59' };
  const roleColor = roleColors[user?.role] || '#004643';

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Sydmi</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">NAVIGATION</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              end={item.path === '/dashboard'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{ background: `${roleColor}22`, color: roleColor }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name truncate">{user?.name}</div>
              <div className="user-role" style={{ color: roleColor }}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="shell-main">
        <header className="topbar">
          <button className="menu-toggle btn btn-ghost btn-sm" onClick={() => setSidebarOpen(v => !v)}>
            ☰
          </button>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="user-avatar sm" style={{ background: `${roleColor}22`, color: roleColor }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm">{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="shell-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
