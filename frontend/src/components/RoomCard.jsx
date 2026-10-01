export default function RoomCard({ room, onSelect, disabled = false }) {
  const isAvailable = room.is_available !== false;

  return (
    <div className="card room-card">
      <div className="card-body">
        <div className="card-header-row">
          <h3>{room.room_type}</h3>
          <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>{isAvailable ? 'Available' : 'Unavailable'}</span>
        </div>
        <p><strong>Room:</strong> {room.room_number}</p>
        <p><strong>Capacity:</strong> {room.capacity} guests</p>
        <p><strong>Price:</strong> ₹{Number(room.price_per_night).toLocaleString('en-IN')}/night</p>
        <p>{room.description}</p>

        <button
          className="btn btn-primary"
          onClick={() => onSelect(room)}
          disabled={!isAvailable || disabled}
        >
          {isAvailable ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
