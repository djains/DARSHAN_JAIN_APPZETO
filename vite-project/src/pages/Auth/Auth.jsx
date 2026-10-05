import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const API_BASE = 'http://localhost:5000/api';

const Icons = {
  logoTicket: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      <path d="M13 5v2"/><path d="M13 11v2"/><path d="M13 17v2"/>
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  )
};

export default function Auth() {
  const { login }     = useAuth();
  const { showToast } = useToast();
  const navigate      = useNavigate();

  const [role, setRole]         = useState('USER');   // 'USER' | 'ADMIN'
  const [tab, setTab]           = useState('login');  // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (tab === 'register' && form.name.trim().length < 2) {
      e.name = 'Full name must be at least 2 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const body = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Authentication failed');
      }

      const { token, user } = data.data;

      // Verify role matches selected portal
      if (tab === 'login' && user.role !== role) {
        throw new Error(`This account is registered as ${user.role}. Please switch portal to ${user.role} to login.`);
      }

      login(user, token);

      showToast(
        tab === 'login'
          ? `Welcome back, ${user.name}!`
          : `Account created successfully! Welcome, ${user.name}!`,
        'success'
      );

      setTimeout(() => {
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500);

    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setErrors({});
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setErrors({});
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-logo">{Icons.logoTicket}</div>
          <h1>AppZeto Movies</h1>
          <p>
            {role === 'USER' ? 'Book movie tickets & lock seats in real-time' : 'Admin management console for events & system'}
          </p>
        </div>

        {/* Role Switcher Segment */}
        <div className="auth-role-switcher">
          <button
            type="button"
            id="portal-user-btn"
            className={`role-switcher-btn ${role === 'USER' ? 'active' : ''}`}
            onClick={() => switchRole('USER')}
          >
            {Icons.user} User Portal
          </button>
          <button
            type="button"
            id="portal-admin-btn"
            className={`role-switcher-btn ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => switchRole('ADMIN')}
          >
            {Icons.shield} Admin Portal
          </button>
        </div>

        {/* Sub-Tabs (Sign In vs Register) */}
        <div className="auth-tabs">
          <button
            type="button"
            id="tab-login"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-register"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Full Name for Registration */}
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="auth-name"
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  autoComplete="name"
                />
                <span className="input-icon">{Icons.user}</span>
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="auth-email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder={role === 'ADMIN' ? 'admin@appzeto.com' : 'user@example.com'}
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                autoComplete="email"
              />
              <span className="input-icon">{Icons.mail}</span>
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div className="input-wrapper">
              <input
                id="auth-password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <span className="input-icon">{Icons.lock}</span>
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass(v => !v)}
                aria-label="Toggle password visibility"
              >
                {showPass ? Icons.eyeOff : Icons.eye}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Submit */}
          <button
            id="auth-submit"
            type="submit"
            className="btn btn-primary btn-full auth-submit"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" /> {tab === 'login' ? 'Authenticating...' : 'Creating Account...'}</>
            ) : tab === 'login' ? (
              `Sign In as ${role === 'ADMIN' ? 'Admin' : 'User'}`
            ) : (
              `Create ${role === 'ADMIN' ? 'Admin' : 'User'} Account`
            )}
          </button>
        </form>

        {/* Footer switch */}
        <p className="auth-footer">
          {tab === 'login' ? (
            <>New to AppZeto? <span onClick={() => switchTab('register')}>Create an account</span></>
          ) : (
            <>Already have an account? <span onClick={() => switchTab('login')}>Sign in</span></>
          )}
        </p>

      </div>
    </div>
  );
}
