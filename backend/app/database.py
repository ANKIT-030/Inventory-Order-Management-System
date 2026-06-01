import os
import ssl
import uuid
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.config import settings

# Supabase pooler (port 6543) uses PgBouncer which doesn't support prepared statements.
# We must disable the prepared statement cache for asyncpg.
connect_args = {}
poolclass = None

if "supabase" in settings.DATABASE_URL or os.getenv("VERCEL"):
    connect_args = {
        "server_settings": {"search_path": "public"},
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
    }
    poolclass = NullPool

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    poolclass=poolclass,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
