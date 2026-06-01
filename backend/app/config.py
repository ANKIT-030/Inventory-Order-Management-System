from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Hardcoded direct connection string to bypass Vercel env vars for now
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Ankit%40811242@db.molsaencoxhtyyfhtpgl.supabase.co:5432/postgres"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = {"extra": "ignore"}

    @model_validator(mode="after")
    def adjust_database_url(self) -> "Settings":
        # Force the URL to bypass any Vercel environment variables that might be set
        self.DATABASE_URL = "postgresql+asyncpg://postgres:Ankit%40811242@db.molsaencoxhtyyfhtpgl.supabase.co:5432/postgres"
        return self


settings = Settings()
