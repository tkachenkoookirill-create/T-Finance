# T-Finance · Backend

FastAPI + PostgreSQL + SQLAlchemy 2.0 + Alembic + JWT.

## Quick start

```bash
cd backend

# 1. Postgres
docker compose up -d

# 2. Python deps (use a venv or uv)
python -m venv .venv && source .venv/bin/activate
pip install -e .

# 3. Env
cp .env.example .env

# 4. Migrations
alembic revision --autogenerate -m "init"
alembic upgrade head

# 5. Seed categories + demo user (demo@tfinance.local / demo1234)
python -m app.seed

# 6. Run
uvicorn app.main:app --reload --port 8000
```

OpenAPI: http://localhost:8000/docs

## Architecture

- **Money:** integer minor units (kopecks / cents) stored as `BIGINT`. Never floats.
- **Auth:** JWT access + refresh. Access TTL 60min, refresh 14d. Bcrypt for password hashing.
- **Transfers:** atomic — pair of mirrored `Transaction` rows linked by `transfer_group_id`.
- **CORS:** see `.env` `CORS_ORIGINS`.

## Endpoints (overview)

| Group | Endpoint |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `GET /auth/me` |
| Accounts | `GET/POST /accounts` · `GET/DELETE /accounts/{id}` |
| Transactions | `GET/POST /transactions` · `DELETE /transactions/{id}` |
| Transfers | `POST /transfers` |
| Cards | `GET/POST /cards` · `PATCH /cards/{id}/status` · `DELETE /cards/{id}` |
| Analytics | `GET /analytics/categories` · `/monthly` · `/net-worth` |
| Investments | `GET /investments/quotes` · `/portfolio` · `POST /investments/trade` · watchlist |
| Credits | `GET /credits` · `POST /credits/apply` |
| Goals | `GET/POST /goals` · `DELETE /goals/{id}` |
