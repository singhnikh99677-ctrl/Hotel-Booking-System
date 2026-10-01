import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/bookings/me', {}, token);
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

  const cancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    setError('');
    try {
      await request(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }, token);
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container main-stack">
      <div className="section-heading">
        <h2>My Bookings</h2>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <Loading text="Loading your bookings..." />
      ) : (
        <div className="booking-list">
          {bookings.length ? (
            bookings.map((booking) => (
              <div key={booking.id} className="card booking-item">
                <div className="card-body booking-row">
                  <div>
                    <p><strong>Booking ID:</strong> #{booking.id}</p>
                    <p><strong>Hotel:</strong> {booking.hotel_name || 'Hotel'}</p>
                    <p><strong>Room:</strong> {booking.room_number || 'Room'}</p>
                    <p><strong>Dates:</strong> {booking.check_in} to {booking.check_out}</p>
                    <p><strong>Booked:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><strong>Guests:</strong> {booking.guests}</p>
                    <p><strong>Total:</strong> ₹{Number(booking.total_amount || 0).toLocaleString('en-IN')}</p>
                    <span className={`status-badge ${String(booking.status || 'CONFIRMED').toLowerCase()}`}>{booking.status || 'CONFIRMED'}</span>
                    <div className="actions-row" style={{ marginTop: '0.75rem' }}>
                      {booking.hotel_id ? <Link to={`/hotels/${booking.hotel_id}`} className="btn btn-light small">View Hotel</Link> : null}
                      {booking.status !== 'CANCELLED' && (
                        <button className="btn btn-light small" disabled={cancellingId === booking.id} onClick={() => cancelBooking(booking.id)}>
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No bookings yet. Start with a premium stay.</div>
          )}
        </div>
      )}
    </div>
  );
}
