import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const emptyForm = {
  name: '',
  location: '',
  description: '',
  rating: 4.5,
  address: '',
  amenities: '',
};

export default function AdminHotels() {
  const { token } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadHotels = async () => {
    setLoading(true);
    try {
      const data = await request('/hotels', {}, token);
      setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadHotels();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (editingId) {
        await request(`/hotels/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
        setSuccess('Hotel updated successfully.');
      } else {
        await request('/hotels', { method: 'POST', body: JSON.stringify(payload) }, token);
        setSuccess('Hotel added successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadHotels();
    } catch (err) {
      setError(err.message || 'Unable to save hotel.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hotel) => {
    setEditingId(hotel.id);
    setForm({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      rating: hotel.rating,
      address: hotel.address,
      amenities: hotel.amenities,
    });
  };

  const handleDelete = async (hotelId) => {
    setError('');
    try {
      await request(`/hotels/${hotelId}`, { method: 'DELETE' }, token);
      await loadHotels();
      setSuccess('Hotel deactivated.');
    } catch (err) {
      setError(err.message || 'Unable to deactivate hotel.');
    }
  };

  return (
    <div className="container main-stack">
      <div className="section-heading">
        <h2>Admin Hotel Management</h2>
      </div>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="card">
        <div className="card-body">
          <h3>{editingId ? 'Edit Hotel' : 'Add Hotel'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="grid-2">
              <label><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label><span>Location</span><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label>
            </div>
            <label><span>Address</span><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></label>
            <label><span>Description</span><textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
            <div className="grid-2">
              <label><span>Rating</span><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} required /></label>
              <label><span>Amenities</span><input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Pool, Gym" required /></label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Hotel' : 'Add Hotel'}</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3>Hotel List</h3>
          {loading ? <Loading text="Loading hotels..." /> : (
            <div className="booking-list">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="card booking-item">
                  <div className="card-body booking-row">
                    <div>
                      <p><strong>{hotel.name}</strong></p>
                      <p>{hotel.location} · ★ {Number(hotel.rating || 0).toFixed(1)}</p>
                      <p>{hotel.address}</p>
                    </div>
                    <div>
                      <p><strong>{hotel.is_active ? 'Active' : 'Inactive'}</strong></p>
                      <div className="actions-row">
                        <button className="btn btn-light small" onClick={() => handleEdit(hotel)}>Edit</button>
                        <button className="btn btn-light small" onClick={() => handleDelete(hotel.id)}>Deactivate</button>
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
