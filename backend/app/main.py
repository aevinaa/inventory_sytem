from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.v1.router import api_router
from app.core.middleware import RequestLoggingMiddleware

# IMPORTANT: import models so SQLAlchemy registers all tables
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup and shutdown."""
    # Create all tables (in production we use Alembic instead)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables ready")
    yield
    # Cleanup on shutdown
    await engine.dispose()
    print("🔌 Database connections closed")


app = FastAPI(
    title="Jewel Inventory API",
    version="1.0.0",
    description="Production inventory management for jewellery, handicrafts & clothing",
    docs_url="/api/docs",      # Swagger UI at this URL
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS: allows the React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://inventory-system-lyart.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

#app.add_middleware(RequestLoggingMiddleware)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Quick check to verify server is running."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}
