from datetime import datetime, date
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── auth ───────────────────────────────────────────────────────────

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field("", max_length=120)
    locale: str = "ru"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"


class UserOut(ORM):
    id: int
    email: EmailStr
    full_name: str
    locale: str
    created_at: datetime


# ── accounts ───────────────────────────────────────────────────────

class AccountIn(BaseModel):
    label: str
    type: Literal["debit", "savings", "fx", "invest", "credit"] = "debit"
    currency: str = "RUB"
    last4: str = ""
    tier: str = ""
    color: str = "var(--brand)"


class AccountOut(ORM):
    id: int
    label: str
    type: str
    currency: str
    balance_minor: int
    last4: str
    tier: str
    color: str


# ── transactions ───────────────────────────────────────────────────

class TransactionIn(BaseModel):
    account_id: int
    amount_minor: int  # signed
    direction: Literal["inflow", "outflow", "transfer"] = "outflow"
    merchant: str = ""
    note: str = ""
    category_key: str | None = None
    is_recurring: bool = False
    occurred_at: datetime | None = None


class TransactionOut(ORM):
    id: int
    account_id: int
    amount_minor: int
    direction: str
    merchant: str
    note: str
    is_recurring: bool
    occurred_at: datetime
    category_key: str | None = None


class TransferIn(BaseModel):
    from_account_id: int
    to_account_id: int
    amount_minor: int = Field(gt=0)
    note: str = ""


# ── cards ──────────────────────────────────────────────────────────

class CardIn(BaseModel):
    account_id: int
    type: Literal["physical", "virtual"] = "virtual"
    label: str = ""
    daily_limit_minor: int = 0


class CardOut(ORM):
    id: int
    account_id: int
    type: str
    status: str
    label: str
    last4: str
    expiry: date | None
    daily_limit_minor: int


class CardStatusIn(BaseModel):
    status: Literal["active", "blocked", "frozen", "closed"]


# ── analytics ──────────────────────────────────────────────────────

class CategorySpend(BaseModel):
    key: str
    label: str
    color_token: str
    value_minor: int


class MonthlyPoint(BaseModel):
    month: str  # YYYY-MM
    inflow_minor: int
    outflow_minor: int


# ── investments ────────────────────────────────────────────────────

class QuoteOut(ORM):
    ticker: str
    name: str
    name_en: str
    price_minor: int
    currency: str
    change_pct: float


class HoldingOut(ORM):
    id: int
    ticker: str
    quantity: float
    avg_price_minor: int


class TradeIn(BaseModel):
    ticker: str
    quantity: float = Field(gt=0)
    side: Literal["buy", "sell"]


# ── credits ────────────────────────────────────────────────────────

class CreditApplicationIn(BaseModel):
    product: Literal["cash", "mortgage", "card", "deposit"]
    principal_minor: int = Field(gt=0)
    term_months: int = Field(ge=1, le=360)


class CreditOut(ORM):
    id: int
    product: str
    principal_minor: int
    rate_pct: float
    term_months: int
    status: str
    monthly_payment_minor: int


# ── goals ──────────────────────────────────────────────────────────

class GoalIn(BaseModel):
    label: str
    target_minor: int = Field(gt=0)
    current_minor: int = 0
    due_date: date | None = None
    currency: str = "RUB"


class GoalOut(ORM):
    id: int
    label: str
    target_minor: int
    current_minor: int
    due_date: date | None
    currency: str
