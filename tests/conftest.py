import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-for-jwt-signing")
os.environ.setdefault("ADMIN_REGISTRATION_KEY", "admin-key-123")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_hotel_booking.db")
os.environ.setdefault("LOG_LEVEL", "INFO")

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


@pytest.fixture(scope="function")
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)
