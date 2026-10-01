from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import Booking, Hotel, Room
from app.schemas import HotelCreate, HotelDetail, HotelOut, HotelUpdate, RoomOut

router = APIRouter()


@router.get("/hotels", response_model=list[HotelOut])
def list_hotels(
    location: str | None = Query(default=None),
    name: str | None = Query(default=None),
    min_rating: float | None = Query(default=None, ge=0, le=5),
    check_in: str | None = Query(default=None, description="YYYY-MM-DD"),
    check_out: str | None = Query(default=None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    query = db.query(Hotel).filter(Hotel.is_active.is_(True))

    if location:
        query = query.filter(Hotel.location.ilike(f"%{location}%"))
    if name:
        query = query.filter(Hotel.name.ilike(f"%{name}%"))
    if min_rating is not None:
        query = query.filter(Hotel.rating >= min_rating)

    hotels = query.order_by(Hotel.rating.desc(), Hotel.id.asc()).all()
    hotel_ids = [hotel.id for hotel in hotels]
    starting_prices = {}
    if hotel_ids:
        starting_prices = dict(
            db.query(Room.hotel_id, func.min(Room.price_per_night))
            .filter(Room.hotel_id.in_(hotel_ids), Room.is_available.is_(True))
            .group_by(Room.hotel_id)
            .all()
        )

    def serialize_hotel(hotel):
        return {
            **HotelOut.model_validate(hotel).model_dump(),
            "starting_price": starting_prices.get(hotel.id),
        }

    if check_in and check_out:
        try:
            parsed_check_in = date.fromisoformat(check_in)
            parsed_check_out = date.fromisoformat(check_out)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dates must be valid ISO strings (YYYY-MM-DD)") from exc

        if parsed_check_in >= parsed_check_out:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="check_in must be before check_out")

        filtered_hotels = []
        for hotel in hotels:
            rooms = db.query(Room).filter(Room.hotel_id == hotel.id, Room.is_available.is_(True)).all()
            if not rooms:
                continue
            has_available_room = True
            for room in rooms:
                overlap = (
                    db.query(Booking)
                    .filter(
                        Booking.room_id == room.id,
                        Booking.status != "CANCELLED",
                        Booking.check_in < parsed_check_out,
                        Booking.check_out > parsed_check_in,
                    )
                    .first()
                )
                if overlap is not None:
                    has_available_room = False
                    break
            if has_available_room:
                filtered_hotels.append(hotel)
        return [serialize_hotel(hotel) for hotel in filtered_hotels]

    return [serialize_hotel(hotel) for hotel in hotels]


@router.get("/hotels/{hotel_id}", response_model=HotelDetail)
def get_hotel_details(hotel_id: int, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id, Hotel.is_active.is_(True)).first()
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")

    hotel_response = {
        "id": hotel.id,
        "name": hotel.name,
        "location": hotel.location,
        "description": hotel.description,
        "rating": hotel.rating,
        "address": hotel.address,
        "amenities": hotel.amenities,
        "is_active": hotel.is_active,
        "created_at": hotel.created_at,
        "rooms": [RoomOut.model_validate(room) for room in hotel.rooms if room.is_available],
    }
    return hotel_response


@router.post("/hotels", response_model=HotelOut, status_code=status.HTTP_201_CREATED)
def create_hotel(
    payload: HotelCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    hotel = Hotel(
        name=payload.name.strip(),
        location=payload.location.strip(),
        description=payload.description.strip(),
        rating=payload.rating,
        address=payload.address.strip(),
        amenities=payload.amenities.strip(),
        is_active=True,
    )
    db.add(hotel)
    db.commit()
    db.refresh(hotel)
    return hotel


@router.put("/hotels/{hotel_id}", response_model=HotelOut)
def update_hotel(
    hotel_id: int,
    payload: HotelUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(hotel, field, value)

    db.commit()
    db.refresh(hotel)
    return hotel


@router.delete("/hotels/{hotel_id}")
def delete_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    hotel.is_active = False
    db.commit()
    return {"message": "Hotel deactivated successfully"}
