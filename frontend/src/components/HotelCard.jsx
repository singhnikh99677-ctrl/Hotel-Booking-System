import { Link } from 'react-router-dom';

function parseAmenities(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export default function HotelCard({ hotel }) {
  const amenities = parseAmenities(hotel.amenities);

  return (
    <article className="card hotel-card">
      <div className="hotel-image-wrap">
        <img
          src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80'}
          alt={hotel.name}
          className="hotel-image"
          loading="lazy"
        />
        <span className="rating-badge image-badge">★ {Number(hotel.rating || 0).toFixed(1)}</span>
      </div>
      <div className="card-body">
        <div className="card-header-row">
          <h3>{hotel.name}</h3>
        </div>
        <p className="muted location-line">{hotel.location}</p>
        <p className="hotel-summary">{hotel.description}</p>
        <div className="amenities">
          {amenities.map((item) => (
            <span key={item} className="chip">{item}</span>
          ))}
        </div>
        <div className="price-row hotel-actions">
          <div>
            <span className="starting-price-label">From</span>
            <strong>{hotel.starting_price != null ? `₹${Number(hotel.starting_price).toLocaleString('en-IN')}` : 'View rooms'}</strong>
          </div>
          <div className="inline-actions">
            <Link to={`/hotels/${hotel.id}`} className="btn btn-light small">View</Link>
            <Link to={`/hotels/${hotel.id}`} className="btn btn-primary small">Book Now</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
