import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const AuthPage = () => {
  const { login, register, guestLogin } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'guest'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else if (mode === 'register') {
        await register(form.username, form.email, form.password);
      } else {
        await guestLogin(form.username);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo/Brand */}
        <div className="auth-brand">
          <div className="auth-logo">💬</div>
          <h1>ChatApp</h1>
          <p>Connect and chat in real time</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
          <button
            className={mode === 'guest' ? 'active' : ''}
            onClick={() => { setMode('guest'); setError(''); }}
          >
            Guest
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(mode === 'register' || mode === 'guest') && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
                required
                minLength={mode === 'guest' ? 2 : 3}
                maxLength={20}
                autoFocus
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Join as Guest'}
          </button>
        </form>

        {mode === 'guest' && (
          <p className="auth-note">
            Guest mode: No registration needed. Your messages persist in history.
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
