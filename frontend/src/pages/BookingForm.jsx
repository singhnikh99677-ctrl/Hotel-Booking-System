import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [form, setForm] = useState({ check_in: '', check_out: '', guests: 2 });
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');

  const selectedRoom = location.state?.room || null;
  const selectedHotel = location.state?.hotel || null;

  useEffect(() => {
    if (location.state?.checkIn) setForm((current) => ({ ...current, check_in: location.state.checkIn }));
    if (location.state?.checkOut) setForm((current) => ({ ...current, check_out: location.state.checkOut }));
    if (location.state?.guests) setForm((current) => ({ ...current, guests: Number(location.state.guests) }));
  }, [location.state]);

  const nights = useMemo(() => {
    if (!form.check_in || !form.check_out) return 0;
    const start = new Date(form.check_in);
    const end = new Date(form.check_out);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [form.check_in, form.check_out]);

  const total = (selectedRoom?.price_per_night || 0) * nights;

  const handleAvailabilityCheck = async () => {
    if (!selectedRoom) return;
    if (!form.check_in || !form.check_out) {
      setError('Please select a check-in and check-out date first.');
      return;
    }

    setCheckingAvailability(true);
    setError('');
    try {
      const data = await request(`/rooms/${selectedRoom.id}/availability?check_in=${form.check_in}&check_out=${form.check_out}`);
      setAvailability(data);
      if (!data.available) {
        setError(data.message || 'This room is unavailable for the selected dates.');
      }
    } catch (err) {
      setError(err.message || 'Unable to check room availability.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRoom || !selectedHotel) {
      setError('Please select a room before booking.');
      return;
    }

    if (!form.check_in || !form.check_out) {
      setError('Check-in and check-out dates are required.');
      return;
    }

    if (new Date(form.check_out) <= new Date(form.check_in)) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    if (Number(form.guests) > Number(selectedRoom.capacity)) {
      setError(`This room fits up to ${selectedRoom.capacity} guests.`);
      return;
    }

    setLoading(true);
    try {
      const result = await request(
        '/bookings',
        {
          method: 'POST',
          body: JSON.stringify({
            room_id: selectedRoom.id,
            check_in: form.check_in,
            check_out: form.check_out,
            guests: Number(form.guests),
          }),
        },
        token,
      );

      navigate('/booking/confirmation', { state: { booking: result, hotel: selectedHotel, room: selectedRoom } });
    } catch (err) {
      setError(err.message || 'Unable to create booking.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRoom || !selectedHotel) {
    return <div className="container"><div className="alert error">Please select a room before booking.</div></div>;
  }

  return (
    <div className="container main-stack">
      <div className="card booking-layout">
        <div className="card-body">
          <h2>Complete Your Booking</h2>

          {error && <div className="alert error">{error}</div>}
          {availability && (
            <div className={`alert ${availability.available ? 'success' : 'error'}`}>
              {availability.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="booking-details">
              <div className="mini-box">
                <p>Hotel</p>
                <h3>{selectedHotel.name}</h3>
              </div>
              <div className="mini-box">
                <p>Room</p>
                <h3>{selectedRoom.room_type}</h3>
              </div>
              <div className="mini-box">
                <p>Price per night</p>
                <h3>₹{Number(selectedRoom.price_per_night).toLocaleString('en-IN')}</h3>
              </div>
            </div>

            <div className="grid-3">
              <label>
                <span>Check-in</span>
                <input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} required />
              </label>
              <label>
                <span>Check-out</span>
                <input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} required />
              </label>
              <label>
                <span>Guests</span>
                <input type="number" min="1" max={selectedRoom.capacity || 4} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} required />
              </label>
            </div>

            <div className="actions-row" style={{ margin: '1rem 0' }}>
              <button type="button" className="btn btn-light" onClick={handleAvailabilityCheck} disabled={checkingAvailability || !form.check_in || !form.check_out}>
                {checkingAvailability ? 'Checking...' : 'Check Availability'}
              </button>
            </div>

            <div className="summary-box">
              <p><strong>Number of nights:</strong> {nights}</p>
              <p><strong>Total amount:</strong> ₹{Number(total).toLocaleString('en-IN')}</p>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading || (availability && !availability.available)}>
              {loading ? 'Confirming booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
