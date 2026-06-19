import enum
from datetime import datetime, date
from sqlalchemy import String, Integer, Boolean, DateTime, Date, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class CardType(str, enum.Enum):
    physical = "physical"
    virtual = "virtual"


class CardStatus(str, enum.Enum):
    active = "active"
    blocked = "blocked"
    frozen = "frozen"
    closed = "closed"


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"))
    type: Mapped[CardType] = mapped_column(Enum(CardType), default=CardType.virtual)
    status: Mapped[CardStatus] = mapped_column(Enum(CardStatus), default=CardStatus.active)
    label: Mapped[str] = mapped_column(String(60), default="")
    last4: Mapped[str] = mapped_column(String(4), default="")
    expiry: Mapped[date | None] = mapped_column(Date, nullable=True)
    daily_limit_minor: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="cards")
    account = relationship("Account", back_populates="cards")
