import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back btn btn-ghost btn-sm">← Back to Home</Link>
      
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="logo-icon-sm mx-auto mb-4">⚡</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Sydmi to start assessing skills</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="John Doe" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="you@example.com" 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              required 
            />
          </div>
          
          <div className="form-group flex-col gap-2">
            <label className="form-label">Role</label>
            <div className="role-selector grid-2">
              <label className={`role-option ${formData.role === 'student' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={formData.role === 'student'} 
                  onChange={e => setFormData({ ...formData, role: e.target.value })} 
                />
                <span className="role-icon">🎓</span> Student
              </label>
              <label className={`role-option ${formData.role === 'teacher' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="teacher" 
                  checked={formData.role === 'teacher'} 
                  onChange={e => setFormData({ ...formData, role: e.target.value })} 
                />
                <span className="role-icon">👩‍🏫</span> Teacher
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Min 6 characters" 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              required 
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center mt-4" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer text-center mt-6 text-sm text-muted">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline" style={{ color: 'var(--primary-light)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
