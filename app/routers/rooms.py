from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin
from app.models import Booking, Hotel, Room
from app.schemas import AvailabilityResponse, RoomCreate, RoomOut, RoomUpdate

router = APIRouter()


@router.get("/hotels/{hotel_id}/rooms", response_model=list[RoomOut])
def list_rooms_for_hotel(hotel_id: int, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id, Hotel.is_active.is_(True)).first()
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")

    rooms = db.query(Room).filter(Room.hotel_id == hotel_id).all()
    return rooms


@router.get("/rooms/{room_id}", response_model=RoomOut)
def get_room_details(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


@router.post("/hotels/{hotel_id}/rooms", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
def create_room(
    hotel_id: int,
    payload: RoomCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id, Hotel.is_active.is_(True)).first()
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")

    existing = db.query(Room).filter(Room.hotel_id == hotel_id, Room.room_number == payload.room_number).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Room number already exists for this hotel")

    room = Room(
        hotel_id=hotel_id,
        room_number=payload.room_number.strip(),
        room_type=payload.room_type.strip(),
        price_per_night=payload.price_per_night,
        capacity=payload.capacity,
        description=payload.description.strip(),
        is_available=payload.is_available,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.put("/rooms/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    payload: RoomUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(room, field, value)

    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    room.is_available = False
    db.commit()
    return {"message": "Room deactivated successfully"}


@router.get("/rooms/{room_id}/availability", response_model=AvailabilityResponse)
def get_room_availability(
    room_id: int,
    check_in: str = Query(..., description="YYYY-MM-DD"),
    check_out: str = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    try:
        check_in_date = date.fromisoformat(check_in)
        check_out_date = date.fromisoformat(check_out)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dates must be valid ISO strings (YYYY-MM-DD)") from exc

    if check_in_date >= check_out_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="check_in must be before check_out")

    overlap = (
        db.query(Booking)
        .filter(
            Booking.room_id == room_id,
            Booking.status != "CANCELLED",
            Booking.check_in < check_out_date,
            Booking.check_out > check_in_date,
        )
        .first()
    )

    available = overlap is None and room.is_available
    message = "Room is available for the selected dates." if available else "Room is not available for the selected dates."
    return AvailabilityResponse(
        room_id=room_id,
        check_in=check_in_date,
        check_out=check_out_date,
        available=available,
        message=message,
    )
