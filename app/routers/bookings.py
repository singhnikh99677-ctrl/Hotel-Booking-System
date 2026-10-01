from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.logging_config import logger
from app.models import Booking, Hotel, Room, User
from app.schemas import AdminStats, BookingCreate, BookingOut, BookingStatusUpdate

router = APIRouter()


def is_room_available(db: Session, room_id: int, check_in: date, check_out: date, exclude_booking_id: int | None = None) -> bool:
    query = (
        db.query(Booking)
        .filter(
            Booking.room_id == room_id,
            Booking.status != "CANCELLED",
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
    )
    if exclude_booking_id is not None:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first() is None


@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info("Booking creation requested")
    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    hotel = db.query(Hotel).filter(Hotel.id == room.hotel_id, Hotel.is_active.is_(True)).first()
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found or inactive")

    if not room.is_available:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Room is unavailable")

    if payload.guests > room.capacity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guest count exceeds room capacity")

    if payload.check_in >= payload.check_out:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="check_in must be before check_out")

    if not is_room_available(db, room.id, payload.check_in, payload.check_out):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Room is already booked for the selected dates")

    nights = (payload.check_out - payload.check_in).days
    if nights <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking length must be at least one night")

    total_amount = nights * room.price_per_night

    logger.info("User ID: %s", current_user.id)
    logger.info("Hotel ID: %s", room.hotel_id)
    logger.info("Room ID: %s", room.id)
    logger.info("Check-in: %s", payload.check_in)
    logger.info("Check-out: %s", payload.check_out)
    logger.info("Guests: %s", payload.guests)

    booking = Booking(
        user_id=current_user.id,
        hotel_id=room.hotel_id,
        room_id=room.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        total_amount=total_amount,
        status="CONFIRMED",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)
    logger.info("Booking created successfully: ID=%s", booking.id)
    return booking


@router.get("/bookings/me", response_model=list[BookingOut])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).order_by(Booking.created_at.desc()).all()
    return bookings


@router.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking_details(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if current_user.role != "ADMIN" and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot access another user's booking")

    return booking


@router.patch("/bookings/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if current_user.role != "ADMIN" and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot cancel another user's booking")

    if booking.status == "CANCELLED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking is already cancelled")

    logger.info("Cancellation requested for booking ID=%s by user ID=%s", booking.id, current_user.id)
    booking.status = "CANCELLED"
    db.commit()
    db.refresh(booking)
    logger.info("Booking cancelled successfully: ID=%s", booking.id)
    return booking


@router.get("/admin/stats", response_model=AdminStats)
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_hotels = db.query(Hotel).count()
    total_rooms = db.query(Room).count()
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "CONFIRMED").count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "CANCELLED").count()
    revenue = db.query(func.coalesce(func.sum(Booking.total_amount), 0.0)).scalar() or 0.0

    return {
        "total_hotels": total_hotels,
        "total_rooms": total_rooms,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "cancelled_bookings": cancelled_bookings,
        "revenue": float(revenue),
    }


@router.get("/bookings", response_model=list[BookingOut])
def list_all_bookings(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return bookings


@router.patch("/bookings/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    booking.status = payload.status.upper()
    db.commit()
    db.refresh(booking)
    return booking
