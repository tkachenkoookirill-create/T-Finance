import enum
from datetime import datetime
from sqlalchemy import String, Integer, BigInteger, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class AccountType(str, enum.Enum):
    debit = "debit"
    savings = "savings"
    fx = "fx"
    invest = "invest"
    credit = "credit"


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    type: Mapped[AccountType] = mapped_column(Enum(AccountType), default=AccountType.debit)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    # Stored as minor units (kopecks/cents) — no floats for money
    balance_minor: Mapped[int] = mapped_column(BigInteger, default=0)
    last4: Mapped[str] = mapped_column(String(4), default="")
    tier: Mapped[str] = mapped_column(String(20), default="")
    color: Mapped[str] = mapped_column(String(40), default="var(--brand)")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    cards = relationship("Card", back_populates="account", cascade="all, delete-orphan")
