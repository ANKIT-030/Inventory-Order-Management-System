from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Hardcoded pooler connection string to bypass Vercel IPv6 issues (Errno 99)
    DATABASE_URL: str = "postgresql+asyncpg://postgres.molsaencoxhtyyfhtpgl:Ankit%40811242@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = {"extra": "ignore"}

    @model_validator(mode="after")
    def adjust_database_url(self) -> "Settings":
        # Force the URL to bypass any Vercel environment variables that might be set
        self.DATABASE_URL = "postgresql+asyncpg://postgres.molsaencoxhtyyfhtpgl:Ankit%40811242@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
        return self


settings = Settings()
