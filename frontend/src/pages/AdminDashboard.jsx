import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await request('/admin/stats', {}, token);
        setStats(data);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    if (token) loadStats();
  }, [token]);

  if (loading) return <Loading text="Loading dashboard..." />;

  return (
    <div className="container main-stack">
      <div className="section-heading">
        <h2>Admin Dashboard</h2>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="stats-grid">
        <div className="stat-card"><strong>{stats?.total_hotels ?? 0}</strong><span>Total Hotels</span></div>
        <div className="stat-card"><strong>{stats?.total_rooms ?? 0}</strong><span>Total Rooms</span></div>
        <div className="stat-card"><strong>{stats?.total_bookings ?? 0}</strong><span>Total Bookings</span></div>
        <div className="stat-card"><strong>{stats?.confirmed_bookings ?? 0}</strong><span>Confirmed Bookings</span></div>
        <div className="stat-card"><strong>{stats?.cancelled_bookings ?? 0}</strong><span>Cancelled Bookings</span></div>
        <div className="stat-card"><strong>₹{Number(stats?.revenue ?? 0).toLocaleString('en-IN')}</strong><span>Revenue</span></div>
      </div>
      <div className="admin-links">
        <Link to="/admin/hotels" className="btn btn-primary">Hotels</Link>
        <Link to="/admin/rooms" className="btn btn-primary">Rooms</Link>
        <Link to="/admin/bookings" className="btn btn-primary">Bookings</Link>
      </div>
    </div>
  );
}
