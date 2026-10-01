from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ConfigBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=6)
    role: str = Field(default="USER")
    admin_registration_key: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        upper_value = value.upper()
        if upper_value not in {"USER", "ADMIN"}:
            raise ValueError("Role must be USER or ADMIN")
        return upper_value


class UserLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(ConfigBaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    email: Optional[str] = Field(default=None, min_length=3, max_length=120)


class HotelCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    location: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=5)
    rating: float = Field(default=3.0, ge=0.0, le=5.0)
    address: str = Field(..., min_length=5, max_length=200)
    amenities: str = Field(..., min_length=2)


class HotelUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    location: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, min_length=5)
    rating: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    address: Optional[str] = Field(default=None, min_length=5, max_length=200)
    amenities: Optional[str] = Field(default=None, min_length=2)
    is_active: Optional[bool] = None


class HotelOut(ConfigBaseModel):
    id: int
    name: str
    location: str
    description: str
    rating: float
    address: str
    amenities: str
    is_active: bool
    created_at: datetime
    starting_price: Optional[float] = None


class RoomCreate(BaseModel):
    room_number: str = Field(..., min_length=1, max_length=50)
    room_type: str = Field(..., min_length=2, max_length=80)
    price_per_night: float = Field(..., gt=0)
    capacity: int = Field(..., gt=0)
    description: str = Field(..., min_length=2)
    is_available: bool = True


class RoomUpdate(BaseModel):
    room_number: Optional[str] = Field(default=None, min_length=1, max_length=50)
    room_type: Optional[str] = Field(default=None, min_length=2, max_length=80)
    price_per_night: Optional[float] = Field(default=None, gt=0)
    capacity: Optional[int] = Field(default=None, gt=0)
    description: Optional[str] = Field(default=None, min_length=2)
    is_available: Optional[bool] = None


class RoomOut(ConfigBaseModel):
    id: int
    hotel_id: int
    room_number: str
    room_type: str
    price_per_night: float
    capacity: int
    description: str
    is_available: bool


class HotelDetail(HotelOut):
    rooms: list[RoomOut] = []


class BookingCreate(BaseModel):
    room_id: int
    check_in: date
    check_out: date
    guests: int = Field(..., gt=0)

    @field_validator("check_out")
    @classmethod
    def validate_dates(cls, value: date, info):
        check_in = info.data.get("check_in")
        if check_in and value <= check_in:
            raise ValueError("check_out must be after check_in")
        return value


class BookingStatusUpdate(BaseModel):
    status: str = Field(..., min_length=3, max_length=20)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        status_value = value.upper()
        valid_statuses = {"CONFIRMED", "CANCELLED", "COMPLETED"}
        if status_value not in valid_statuses:
            raise ValueError("Status must be one of CONFIRMED, CANCELLED, COMPLETED")
        return status_value


class BookingOut(ConfigBaseModel):
    id: int
    user_id: int
    hotel_id: int
    room_id: int
    hotel_name: str = ""
    room_number: str = ""
    room_type: str = ""
    check_in: date
    check_out: date
    guests: int
    total_amount: float
    status: str
    created_at: datetime
    nights: int = 0


class AdminStats(BaseModel):
    total_hotels: int
    total_rooms: int
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    revenue: float


class AvailabilityResponse(BaseModel):
    room_id: int
    check_in: date
    check_out: date
    available: bool
    message: str


class HealthResponse(BaseModel):
    status: str
    database: str
