import os
import sys
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent
if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent

DEFAULT_DATABASE_PATH = BASE_DIR / "hotel_booking.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}")

if DATABASE_URL.startswith("sqlite") and not DATABASE_URL.startswith("sqlite:///:memory:") and not DATABASE_URL.startswith("sqlite:////"):
    relative_db_path = DATABASE_URL.replace("sqlite:///", "", 1)
    if relative_db_path.startswith("./"):
        relative_db_path = relative_db_path[2:]
    if relative_db_path and not Path(relative_db_path).is_absolute():
        DATABASE_URL = f"sqlite:///{(BASE_DIR / relative_db_path).as_posix()}"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
