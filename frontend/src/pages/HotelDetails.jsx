import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import RoomCard from '../components/RoomCard';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';

function parseAmenities(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function HotelDetails() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHotel = async () => {
      setLoading(true);
      setError('');
      try {
        const hotelData = await request(`/hotels/${hotelId}`);
        setHotel(hotelData);

        const roomData = await request(`/hotels/${hotelId}/rooms`);
        setRooms(Array.isArray(roomData) ? roomData : []);
      } catch (err) {
        setError(err.message || 'Unable to load hotel details.');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) loadHotel();
  }, [hotelId]);

  const handleRoomSelect = (room) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/hotels/${hotelId}` } } });
      return;
    }

    navigate(`/rooms/${room.id}/book`, {
      state: {
        hotel,
        room,
      },
    });
  };

  if (loading) return <Loading text="Loading hotel details..." />;
  if (error) return <div className="container"><div className="alert error">{error}</div></div>;
  if (!hotel) return null;

  return (
    <div className="container main-stack">
      <div className="card">
        <div className="card-body">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Hotel</p>
              <h2>{hotel.name}</h2>
            </div>
            <span className="rating-badge">★ {Number(hotel.rating || 0).toFixed(1)}</span>
          </div>

          <div className="detail-grid" style={{ marginTop: '1rem' }}>
            <div>
              <img
                src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                alt={hotel.name}
                className="detail-image"
                loading="lazy"
              />
              <p><strong>Location:</strong> {hotel.location}</p>
              <p><strong>Address:</strong> {hotel.address}</p>
              <p>{hotel.description}</p>
              <div className="amenities">
                {parseAmenities(hotel.amenities).map((item) => (
                  <span key={item} className="chip">{item}</span>
                ))}
              </div>
            </div>

            <div className="mini-box">
              <p><strong>Starting from</strong></p>
              <h3>₹{Math.min(...rooms.map((room) => Number(room.price_per_night || 0))).toLocaleString('en-IN')}</h3>
              <p>Per night</p>
              <div className="actions-row" style={{ marginTop: '1rem' }}>
                <Link to="/" className="btn btn-light">Back to home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <h2>Available Rooms</h2>
      </div>
      <div className="card-grid">
        {rooms.length ? (
          rooms.map((room) => <RoomCard key={room.id} room={room} onSelect={handleRoomSelect} />)
        ) : (
          <div className="empty-state">No rooms available at this time.</div>
        )}
      </div>
    </div>
  );
}
