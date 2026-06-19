from datetime import datetime
from sqlalchemy import String, Integer, BigInteger, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class Quote(Base):
    """Latest market quote per ticker — populated by a worker or seeded for demo."""
    __tablename__ = "quotes"

    ticker: Mapped[str] = mapped_column(String(12), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    name_en: Mapped[str] = mapped_column(String(120), default="")
    # Price in minor units of the quote currency
    price_minor: Mapped[int] = mapped_column(BigInteger, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    change_pct: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Holding(Base):
    __tablename__ = "holdings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    ticker: Mapped[str] = mapped_column(String(12), ForeignKey("quotes.ticker"))
    quantity: Mapped[float] = mapped_column(Numeric(18, 6), default=0)
    avg_price_minor: Mapped[int] = mapped_column(BigInteger, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="holdings")
    quote = relationship("Quote")


class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    ticker: Mapped[str] = mapped_column(String(12), ForeignKey("quotes.ticker"))
    position: Mapped[int] = mapped_column(Integer, default=0)

    quote = relationship("Quote")
