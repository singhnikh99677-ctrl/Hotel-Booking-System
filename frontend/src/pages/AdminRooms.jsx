import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const emptyForm = {
  hotel_id: '',
  room_number: '',
  room_type: '',
  price_per_night: 2000,
  capacity: 2,
  description: '',
  is_available: true,
};

export default function AdminRooms() {
  const { token } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const hotelData = await request('/hotels', {}, token);
      setHotels(Array.isArray(hotelData) ? hotelData : []);
      if (!form.hotel_id && Array.isArray(hotelData) && hotelData[0]) {
        setForm((current) => ({ ...current, hotel_id: String(hotelData[0].id) }));
      }
      if (form.hotel_id || (Array.isArray(hotelData) && hotelData[0])) {
        const selectedHotelId = form.hotel_id || hotelData[0].id;
        const roomData = await request(`/hotels/${selectedHotelId}/rooms`, {}, token);
        setRooms(Array.isArray(roomData) ? roomData : []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  useEffect(() => {
    if (token && form.hotel_id) {
      request(`/hotels/${form.hotel_id}/rooms`, {}, token)
        .then((data) => setRooms(Array.isArray(data) ? data : []))
        .catch(() => setRooms([]));
    }
  }, [form.hotel_id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        hotel_id: Number(form.hotel_id),
        price_per_night: Number(form.price_per_night),
        capacity: Number(form.capacity),
      };
      if (editingId) {
        await request(`/rooms/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
        setSuccess('Room updated successfully.');
      } else {
        await request(`/hotels/${payload.hotel_id}/rooms`, { method: 'POST', body: JSON.stringify(payload) }, token);
        setSuccess('Room added successfully.');
      }
      setForm({ ...emptyForm, hotel_id: String(payload.hotel_id) });
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to save room.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({
      hotel_id: String(room.hotel_id),
      room_number: room.room_number,
      room_type: room.room_type,
      price_per_night: room.price_per_night,
      capacity: room.capacity,
      description: room.description,
      is_available: room.is_available,
    });
  };

  const handleDelete = async (roomId) => {
    try {
      await request(`/rooms/${roomId}`, { method: 'DELETE' }, token);
      setSuccess('Room deactivated.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to deactivate room.');
    }
  };

  return (
    <div className="container main-stack">
      <div className="section-heading"><h2>Admin Room Management</h2></div>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="card">
        <div className="card-body">
          <h3>{editingId ? 'Edit Room' : 'Add Room'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span>Hotel</span>
              <select value={form.hotel_id} onChange={(e) => setForm({ ...form, hotel_id: e.target.value })}>
                {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
              </select>
            </label>
            <div className="grid-2">
              <label><span>Room Number</span><input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} required /></label>
              <label><span>Room Type</span><input value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} required /></label>
            </div>
            <div className="grid-2">
              <label><span>Price per Night</span><input type="number" min="1" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: e.target.value })} required /></label>
              <label><span>Capacity</span><input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required /></label>
            </div>
            <label><span>Description</span><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
            <label><span>Status</span><select value={String(form.is_available)} onChange={(e) => setForm({ ...form, is_available: e.target.value === 'true' })}><option value="true">Available</option><option value="false">Unavailable</option></select></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Room' : 'Add Room'}</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3>Room List</h3>
          {loading ? <Loading text="Loading rooms..." /> : (
            <div className="booking-list">
              {rooms.map((room) => (
                <div key={room.id} className="card booking-item">
                  <div className="card-body booking-row">
                    <div>
                      <p><strong>{room.room_type}</strong> · {room.room_number}</p>
                      <p>Capacity {room.capacity} · ₹{Number(room.price_per_night).toLocaleString('en-IN')}/night</p>
                    </div>
                    <div>
                      <p>{room.is_available ? 'Available' : 'Unavailable'}</p>
                      <div className="actions-row">
                        <button className="btn btn-light small" onClick={() => handleEdit(room)}>Edit</button>
                        <button className="btn btn-light small" onClick={() => handleDelete(room.id)}>Deactivate</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
