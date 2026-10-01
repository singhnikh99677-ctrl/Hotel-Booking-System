import { useState } from 'react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setLoading(true);
    try {
      const data = await request('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: form.name, email: form.email }),
      }, token);
      setUser(data);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-stack">
      <div className="card profile-card">
        <div className="card-body">
          <h2>Profile</h2>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <div className="profile-box">
            <p><strong>Name:</strong> {user?.name || 'Guest'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role || 'USER'}</p>
            <p><strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1rem' }}>
            <label>
              <span>Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Profile'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
