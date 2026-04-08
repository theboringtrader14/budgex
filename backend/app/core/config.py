import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost/budgex_db")
    port: int = int(os.getenv("PORT", "8002"))
    budgex_api_key: str = os.getenv("BUDGEX_API_KEY", "budgex-secret-key")


settings = Settings()
