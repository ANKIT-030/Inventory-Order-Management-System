import asyncio
import os
import sys

# Set Supabase URL
os.environ["DATABASE_URL"] = "postgresql://postgres.molsaencoxhtyyfhtpgl:Ankit@811242@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

# Import engine and base from our app
from backend.app.database import engine, Base

async def init_db():
    print("Creating tables in Supabase...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
