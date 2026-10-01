import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from sqlalchemy import text

from app.database import engine
from app.logging_config import logger
from app.metrics import REQUEST_COUNT, REQUEST_LATENCY
from app.models import Base
from app.routers import auth, bookings, hotels, rooms

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"


def get_cors_origins() -> list[str]:
    configured = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000",
    )
    origins = []
    for origin in configured.split(","):
        candidate = origin.strip()
        if candidate:
            origins.append(candidate)
    return origins or [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Application startup complete")
    yield
    logger.info("Application shutdown complete")


app = FastAPI(
    title="Hotel Booking System",
    version="1.0.0",
    description="Hotel search and booking system with CI/CD automation and monitoring.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start_time
    endpoint = request.url.path
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=endpoint,
        status=response.status_code,
    ).inc()
    REQUEST_LATENCY.labels(method=request.method, endpoint=endpoint).observe(duration)
    return response


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(hotels.router, tags=["Hotels"])
app.include_router(rooms.router, tags=["Rooms"])
app.include_router(bookings.router, tags=["Bookings"])


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    serializable_errors = []
    for error in exc.errors():
        clean_error = {
            "loc": list(error.get("loc", [])),
            "msg": error.get("msg"),
            "type": error.get("type"),
        }
        ctx = error.get("ctx")
        if ctx:
            clean_error["ctx"] = {key: str(value) for key, value in ctx.items()}
        serializable_errors.append(clean_error)
    return JSONResponse(status_code=400, content={"detail": serializable_errors})


if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="frontend-assets")


@app.get("/", include_in_schema=False)
async def root():
    index_path = FRONTEND_DIST / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"message": "Hotel Booking System API is running"}


@app.get("/health")
async def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as exc:  # pragma: no cover
        logger.exception("Database health check failed")
        raise HTTPException(status_code=503, detail={"status": "unhealthy", "database": "disconnected"}) from exc


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/{path:path}", include_in_schema=False)
async def serve_frontend(path: str):
    index_path = FRONTEND_DIST / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend build not found")
    return FileResponse(index_path)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.getenv("HOST", "127.0.0.1"), port=8000, reload=False)