from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    bookings = relationship("Booking", back_populates="user")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    rating = Column(Float, default=3.0, nullable=False)
    address = Column(String(200), nullable=False)
    amenities = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="hotel")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_number = Column(String(50), nullable=False)
    room_type = Column(String(80), nullable=False)
    price_per_night = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    hotel = relationship("Hotel", back_populates="rooms")
    bookings = relationship("Booking", back_populates="room")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), default="CONFIRMED", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="bookings")
    hotel = relationship("Hotel", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")

    @property
    def hotel_name(self) -> str:
        return self.hotel.name if self.hotel else ""

    @property
    def room_number(self) -> str:
        return self.room.room_number if self.room else ""

    @property
    def room_type(self) -> str:
        return self.room.room_type if self.room else ""

    @property
    def nights(self) -> int:
        if not self.check_in or not self.check_out:
            return 0
        return (self.check_out - self.check_in).days
