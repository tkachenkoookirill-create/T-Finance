from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, accounts, transactions, transfers, cards, analytics, investments, credits, goals

app = FastAPI(title="T-Finance API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
def health():
    return {"ok": True, "env": settings.env}


for r in (
    auth.router, accounts.router, transactions.router, transfers.router,
    cards.router, analytics.router, investments.router, credits.router, goals.router,
):
    app.include_router(r)
