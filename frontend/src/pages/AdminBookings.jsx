import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await request('/bookings', {}, token);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadBookings();
  }, [token]);

  const updateStatus = async (bookingId, status) => {
    try {
      await request(`/bookings/${bookingId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to update booking status.');
    }
  };

  return (
    <div className="container main-stack">
      <div className="section-heading"><h2>Admin Booking Management</h2></div>
      {error && <div className="alert error">{error}</div>}
      {loading ? <Loading text="Loading bookings..." /> : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="card booking-item">
              <div className="card-body booking-row">
                <div>
                  <p><strong>Booking #{booking.id}</strong></p>
                  <p>Hotel ID: {booking.hotel_id} · Room ID: {booking.room_id}</p>
                  <p>Dates: {booking.check_in} to {booking.check_out}</p>
                  <p>Guests: {booking.guests}</p>
                  <p>Total: ₹{Number(booking.total_amount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className={`status-badge ${String(booking.status || 'CONFIRMED').toLowerCase()}`}>{booking.status}</span>
                  <div className="actions-row" style={{ marginTop: '0.75rem' }}>
                    <button className="btn btn-light small" onClick={() => updateStatus(booking.id, 'CONFIRMED')}>Confirm</button>
                    <button className="btn btn-light small" onClick={() => updateStatus(booking.id, 'COMPLETED')}>Complete</button>
                    <button className="btn btn-light small" onClick={() => updateStatus(booking.id, 'CANCELLED')}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
