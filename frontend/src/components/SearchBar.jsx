export default function SearchBar({ filters, setFilters, onSearch, loading = false }) {
  return (
    <div className="search-panel card">
      <div className="card-body">
        <div className="grid-5">
          <label>
            <span>Destination</span>
            <input value={filters.location || ''} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Mumbai, Goa, Jaipur" />
          </label>

          <label>
            <span>Check-in</span>
            <input type="date" value={filters.checkIn || ''} onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })} />
          </label>

          <label>
            <span>Check-out</span>
            <input type="date" value={filters.checkOut || ''} onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })} />
          </label>

          <label>
            <span>Guests</span>
            <input type="number" min="1" max="6" value={filters.guests || 2} onChange={(e) => setFilters({ ...filters, guests: Number(e.target.value) || 1 })} />
          </label>

          <div className="search-actions">
            <button className="btn btn-primary btn-block" onClick={onSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search Hotels'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
