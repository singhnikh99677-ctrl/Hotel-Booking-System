import { Link, useLocation } from 'react-router-dom';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const booking = state?.booking;
  const hotel = state?.hotel;
  const room = state?.room;

  if (!booking) {
    return (
      <div className="container main-stack">
        <div className="alert error">Booking details are unavailable.</div>
      </div>
    );
  }

  const handlePrint = () => window.print();

  return (
    <div className="container main-stack">
      <div className="card success-card">
        <div className="card-body" style={{ padding: '2rem' }}>
          <div className="alert success">Booking confirmed successfully.</div>
          <h2>Reservation Details</h2>
          <div className="grid-2" style={{ marginTop: '1rem' }}>
            <div className="mini-box">
              <p>Booking ID</p>
              <h3>#{booking.id || 'N/A'}</h3>
            </div>
            <div className="mini-box">
              <p>Status</p>
              <h3>{booking.status || 'CONFIRMED'}</h3>
            </div>
            <div className="mini-box">
              <p>Hotel</p>
              <h3>{booking.hotel_name || hotel?.name || 'Hotel'}</h3>
            </div>
            <div className="mini-box">
              <p>Room</p>
              <h3>{booking.room_number || room?.room_number || room?.room_type || 'Room'}</h3>
            </div>
            <div className="mini-box">
              <p>Check-in</p>
              <h3>{booking.check_in || 'N/A'}</h3>
            </div>
            <div className="mini-box">
              <p>Check-out</p>
              <h3>{booking.check_out || 'N/A'}</h3>
            </div>
            <div className="mini-box">
              <p>Guests</p>
              <h3>{booking.guests || 1}</h3>
            </div>
            <div className="mini-box">
              <p>Total Amount</p>
              <h3>₹{Number(booking.total_amount || 0).toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="actions-row" style={{ marginTop: '1.5rem' }}>
            <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>
            <Link to="/" className="btn btn-light">Back to Home</Link>
            <button type="button" className="btn btn-light" onClick={handlePrint}>Print / Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
