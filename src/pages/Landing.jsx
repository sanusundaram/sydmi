import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '🎯', title: 'Smart Quiz Engine', desc: 'Adaptive quizzes that target specific knowledge domains and skill areas.' },
  { icon: '📊', title: 'Skill Gap Analysis', desc: 'Visual breakdown of strengths and weaknesses per topic and domain.' },
  { icon: '👩‍🏫', title: 'Teacher Toolkit', desc: 'Create quizzes, monitor class performance, and identify struggling students.' },
  { icon: '⚡', title: 'Real-Time Results', desc: 'Instant scoring and detailed feedback as soon as a quiz is submitted.' },
  { icon: '🔒', title: 'Role-Based Access', desc: 'Separate dashboards for students, teachers, and administrators.' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Track learning progress over time with historical performance data.' },
];

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Quizzes' },
  { value: '98%', label: 'Accuracy' },
  { value: '24/7', label: 'Availability' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon-sm">⚡</span>
          <span className="logo-text-nav">Sydmi</span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span>🚀</span> Introducing Sydmi — Next-gen Learning Analytics
        </div>
        <h1 className="hero-title">
          Identify Skill Gaps.<br />
          <span className="text-gradient">Accelerate Learning.</span>
        </h1>
        <p className="hero-subtitle">
          Sydmi is a comprehensive skill gap analysis platform that helps educators 
          measure student performance, identify knowledge weaknesses, and drive 
          better learning outcomes through intelligent quizzes and analytics.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg">Start for Free →</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>

        {/* Stats row */}
        <div className="hero-stats">
          {stats.map(s => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-badge">✨ Features</div>
          <h2 className="section-title">Everything you need to close the skill gap</h2>
          <p className="section-subtitle">A complete ecosystem for assessment, analysis, and improvement.</p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles section */}
      <section className="roles-section">
        <div className="section-header">
          <div className="section-badge">👤 Roles</div>
          <h2 className="section-title">Built for every stakeholder</h2>
        </div>
        <div className="roles-grid">
          <div className="role-card role-student">
            <div className="role-emoji">🎓</div>
            <h3>Student</h3>
            <ul>
              <li>Take subject quizzes</li>
              <li>View instant scores</li>
              <li>See skill gap charts</li>
              <li>Track progress over time</li>
            </ul>
          </div>
          <div className="role-card role-teacher">
            <div className="role-emoji">👩‍🏫</div>
            <h3>Teacher</h3>
            <ul>
              <li>Create custom quizzes</li>
              <li>Manage questions &amp; topics</li>
              <li>Monitor class analytics</li>
              <li>Identify at-risk students</li>
            </ul>
          </div>
          <div className="role-card role-admin">
            <div className="role-emoji">⚙️</div>
            <h3>Administrator</h3>
            <ul>
              <li>Manage all users</li>
              <li>System-wide analytics</li>
              <li>Oversee all quizzes</li>
              <li>Configure system settings</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2>Ready to transform learning outcomes?</h2>
        <p>Join thousands of educators and students already using Sydmi.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Your Account →</Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <span>⚡</span> Sydmi
        </div>
        <p>© 2024 Sydmi. Skill Gap Analysis System. All rights reserved.</p>
      </footer>
    </div>
  );
}
