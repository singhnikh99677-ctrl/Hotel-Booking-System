import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      const redirectTo = user?.role === 'ADMIN' ? '/admin' : location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <div className="card-body">
          <div className="form-header">
            <h2>Welcome back</h2>
            <p className="form-subtitle">Sign in to manage your stay</p>
          </div>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          </form>
          <p className="muted mt-16">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
