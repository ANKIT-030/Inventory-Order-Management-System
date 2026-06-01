from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import create_tables, get_db
from app.routers import auth, customers, dashboard, orders, products, exports
from app.middleware import RequestIDMiddleware, RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    import os
    if not os.getenv("VERCEL"):
        await create_tables()
    yield
    # Shutdown (no-op)


app = FastAPI(
    title="Inventory & Order Management System",
    description="A complete backend API for managing inventory, customers, and orders.",
    version="1.0.0",
    lifespan=lifespan,
)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

# Root endpoints
@app.get("/")
async def root() -> dict:
    return {"message": "Inventory & Order Management API"}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail={"status": "unhealthy", "database": "disconnected"})

# API v1 Router
api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(auth.router)
api_v1.include_router(products.router)
api_v1.include_router(customers.router)
api_v1.include_router(orders.router)
api_v1.include_router(dashboard.router)
api_v1.include_router(exports.router)

app.include_router(api_v1)


@app.get("/debug")
async def debug_info(db: AsyncSession = Depends(get_db)):
    import os
    import traceback
    
    db_url = os.getenv("DATABASE_URL", "NOT SET")
    # Mask the password for safety
    if "@" in db_url:
        parts = db_url.split("@")
        masked = parts[0][:20] + "***@" + parts[-1]
    else:
        masked = db_url[:30] + "..."
        
    db_error = None
    db_connected = False
    try:
        await db.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        db_error = str(e)
        
    return {
        "database_url_set": db_url != "NOT SET",
        "database_url_preview": masked,
        "vercel_env": os.getenv("VERCEL", "NOT SET"),
        "db_connected": db_connected,
        "db_error": db_error,
    }
