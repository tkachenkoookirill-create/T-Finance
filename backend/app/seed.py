"""Seed default categories + an optional demo user with sample data.

Run:   python -m app.seed
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from .db import SessionLocal, engine, Base
from . import models  # noqa: F401  — register tables
from .models import (
    User, Account, AccountType, Transaction, TxDirection,
    Category, Quote, WatchlistItem, Goal,
)
from .security import hash_password


CATEGORIES = [
    ("rent",          "Аренда",        "Rent",          "var(--c1)", "expense"),
    ("food",          "Продукты",      "Groceries",     "var(--c2)", "expense"),
    ("transport",     "Транспорт",     "Transport",     "var(--c3)", "expense"),
    ("entertainment", "Развлечения",   "Entertainment", "var(--c4)", "expense"),
    ("services",      "Сервисы",       "Subscriptions", "var(--c5)", "expense"),
    ("healthcare",    "Здоровье",      "Healthcare",    "var(--c6)", "expense"),
    ("other",         "Прочее",        "Other",         "var(--c7)", "expense"),
    ("salary",        "Зарплата",      "Salary",        "var(--c1)", "income"),
    ("freelance",     "Фриланс",       "Freelance",     "var(--c2)", "income"),
    ("dividends",     "Дивиденды",     "Dividends",     "var(--c5)", "income"),
]

QUOTES = [
    ("SBER", "Сбер",     "Sberbank", 28642,  "RUB", 1.84),
    ("YNDX", "Яндекс",   "Yandex",   314200, "RUB", -0.62),
    ("LKOH", "Лукойл",   "Lukoil",   712800, "RUB", 0.42),
    ("GAZP", "Газпром",  "Gazprom",  15840,  "RUB", -1.24),
    ("AAPL", "Apple",    "Apple",    18960,  "USD", 0.86),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # categories
        for key, ru, en, color, kind in CATEGORIES:
            if not db.scalar(select(Category).where(Category.key == key)):
                db.add(Category(key=key, label_ru=ru, label_en=en, color_token=color, kind=kind))
        # quotes
        for ticker, ru, en, price, cur, ch in QUOTES:
            existing = db.get(Quote, ticker)
            if not existing:
                db.add(Quote(ticker=ticker, name=ru, name_en=en, price_minor=price, currency=cur, change_pct=ch))
        db.commit()

        # demo user
        email = "demo@tfinance.local"
        user = db.scalar(select(User).where(User.email == email))
        if not user:
            user = User(email=email, password_hash=hash_password("demo1234"), full_name="Alex Demo", locale="ru")
            db.add(user); db.commit(); db.refresh(user)

            main = Account(user_id=user.id, label="Главный счёт", type=AccountType.debit,
                           balance_minor=48_234_000, last4="4421", tier="Black", color="var(--brand)")
            sav  = Account(user_id=user.id, label="Накопительный", type=AccountType.savings,
                           balance_minor=124_000_000, last4="8814", color="var(--c2)")
            inv  = Account(user_id=user.id, label="Брокерский", type=AccountType.invest,
                           balance_minor=61_240_000, last4="0341", color="var(--c5)")
            db.add_all([main, sav, inv]); db.commit()

            now = datetime.now(timezone.utc)
            cat = {c.key: c for c in db.scalars(select(Category)).all()}
            tx_seed = [
                (main, +21_000_000, "salary",   "inflow",  "Зарплата · Yandex"),
                (main, -124_000,    "food",     "outflow", "Vkusvill"),
                (main, -39_900,     "services", "outflow", "Yandex Plus"),
                (main, -345_000,    "food",     "outflow", "Кафе Пушкин"),
                (main, -129_000,    "entertainment", "outflow", "Apple.com"),
                (main, -6_400,      "transport","outflow", "Метро"),
            ]
            for acc, amt, ck, dirn, merchant in tx_seed:
                db.add(Transaction(
                    account_id=acc.id,
                    category_id=cat[ck].id,
                    amount_minor=amt,
                    direction=TxDirection(dirn),
                    merchant=merchant,
                    occurred_at=now - timedelta(hours=len(merchant)),
                ))
            for q in db.scalars(select(Quote)).all():
                db.add(WatchlistItem(user_id=user.id, ticker=q.ticker))
            db.add(Goal(user_id=user.id, label="Отпуск · Грузия",
                        target_minor=18_000_000, current_minor=12_400_000))
            db.commit()
            print(f"✓ Demo user: {email} / demo1234")
        else:
            print(f"✓ Demo user already exists: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
