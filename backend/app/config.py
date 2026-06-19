from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://tfinance:tfinance@localhost:5432/tfinance"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_ttl_min: int = 60
    refresh_token_ttl_days: int = 14
    cors_origins: str = "http://localhost:3000,http://localhost:19006"
    default_currency: str = "RUB"
    env: str = "dev"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
