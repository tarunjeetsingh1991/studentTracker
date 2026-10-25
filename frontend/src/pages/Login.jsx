
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LockKeyhole } from 'lucide-react';
import { api } from '../api';

export default function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password
        })
      });

      // Navigate to homepage after successful login
      navigate('/', { replace: true });

    } catch (err) {
      setError(
        err.message || 'Invalid username or password'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Application icon */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: '#e3efff',
              color: '#266bc4'
            }}
          >
            <GraduationCap size={34} />
          </div>

          <h1 className="h3 fw-bold mb-2">
            Student Progress Tracker
          </h1>

          <p className="text-muted mb-0">
            Administrator Login
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin}>

          {/* Username */}
          <div className="mb-3">
            <label
              htmlFor="username"
              className="form-label fw-semibold"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="form-label fw-semibold"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            <LockKeyhole size={18} />

            {loading ? 'Signing in...' : 'Login'}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-muted small mt-4 mb-0">
          Secure classroom management
        </p>

      </div>
    </div>
  );
}
