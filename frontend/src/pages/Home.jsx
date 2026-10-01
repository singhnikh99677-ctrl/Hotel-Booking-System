import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import { request } from '../services/api';

const destinations = [
  { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80' },
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jaipur', image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7c2b0?auto=format&fit=crop&w=800&q=80' },
];

const benefits = [
  { title: 'Best Price', text: 'Exclusive rates, curated offers, and instant savings on premium stays.' },
  { title: 'Secure Booking', text: 'Protected payments and transparent confirmations for every reservation.' },
  { title: 'Verified Hotels', text: 'Only trusted properties and carefully audited hospitality partners.' },
  { title: 'Easy Cancellation', text: 'Flexible date changes and simple cancellation policies for peace of mind.' },
  { title: '24/7 Support', text: 'Round-the-clock assistance before, during, and after your trip.' },
];

const testimonials = [
  { quote: 'The booking experience felt effortless and the property exceeded every expectation.', name: 'Aisha K.', title: 'Business Traveler' },
  { quote: 'From the seamless check-in to the service quality, everything was beautifully managed.', name: 'Daniel R.', title: 'Weekend Guest' },
  { quote: 'I booked a luxury stay for my family in minutes and the entire process was stress-free.', name: 'Priya S.', title: 'Family Traveler' },
];

export default function Home() {
  const [filters, setFilters] = useState({ location: '', checkIn: '', checkOut: '', guests: 2 });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHotels = async (query = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.location) params.set('location', query.location);
      if (query.checkIn) params.set('check_in', query.checkIn);
      if (query.checkOut) params.set('check_out', query.checkOut);
      const url = params.toString() ? `/hotels?${params}` : '/hotels';
      const data = await request(url);
      setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Curated escapes</p>
            <h1>Find Your Perfect Stay</h1>
            <p>Luxury rooms, vibrant destinations, and thoughtful hospitality across the world’s most memorable cities.</p>
          </div>
        </div>
      </section>

      <div className="container main-stack">
        <SearchBar filters={filters} setFilters={setFilters} onSearch={() => loadHotels(filters)} loading={loading} />

        <div className="section-heading">
          <h2>Featured Hotels</h2>
          <Link to="/" className="muted-link">{hotels.length} stays available</Link>
        </div>

        {error && <div className="alert error">{error}</div>}

        {loading ? (
          <Loading text="Finding your ideal stay..." />
        ) : hotels.length > 0 ? (
          <div className="card-grid">
            {hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        ) : (
          <div className="empty-state">No hotels found for your search.</div>
        )}

        <div className="section-heading">
          <h2>Why Choose Us</h2>
        </div>
        <div className="card-grid three">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="card">
              <div className="card-body">
                <h3>{benefit.title}</h3>
                <p className="muted">{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-heading">
          <h2>Popular Destinations</h2>
        </div>
        <div className="card-grid three">
          {destinations.map((destination) => (
            <div key={destination.name} className="card hotel-card">
              <div className="hotel-image-wrap">
                <img src={destination.image} alt={destination.name} className="hotel-image" loading="lazy" />
              </div>
              <div className="card-body">
                <h3>{destination.name}</h3>
                <p className="muted">Discover iconic stays, beaches, heritage hotels, and unforgettable city escapes.</p>
                <Link to="/" className="btn btn-light small">Explore</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="section-heading">
          <h2>Guest Reviews</h2>
        </div>
        <div className="card-grid three">
          {testimonials.map((item) => (
            <div key={item.name} className="card">
              <div className="card-body">
                <div className="rating-badge">★★★★★</div>
                <p className="hotel-summary">“{item.quote}”</p>
                <strong>{item.name}</strong>
                <p className="muted">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <p className="eyebrow" style={{ color: '#8b5e3c' }}>Ready for your next stay?</p>
            <h2>Plan a luxurious escape with Asteria Stay</h2>
            <Link to="/hotels/1" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>Browse Signature Stays</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
