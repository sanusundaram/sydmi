import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/users')
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      setUsers(users.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="page">
      <div className="page-header mb-8">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage all students, teachers, and administrators.</p>
      </div>

      {loading ? (
        <div className="spinner mx-auto mt-10" />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td className="font-semibold">{user.name}</td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    <span 
                      className="badge capitalize"
                      style={{
                        background: user.role === 'admin' ? 'rgba(245,158,11,0.15)' : user.role === 'teacher' ? 'rgba(255,107,157,0.15)' : 'rgba(108,99,255,0.15)',
                        color: user.role === 'admin' ? 'var(--warning)' : user.role === 'teacher' ? 'var(--accent)' : 'var(--primary-light)',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleToggleActive(user)} 
                        className="btn btn-secondary btn-sm"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)} 
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
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
