import enum
from datetime import datetime
from sqlalchemy import String, Integer, BigInteger, Numeric, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class CreditStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    active = "active"
    rejected = "rejected"
    closed = "closed"


class Credit(Base):
    __tablename__ = "credits"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    product: Mapped[str] = mapped_column(String(80))  # 'cash', 'mortgage', 'card', 'deposit'
    principal_minor: Mapped[int] = mapped_column(BigInteger, default=0)
    rate_pct: Mapped[float] = mapped_column(Numeric(6, 3), default=0)
    term_months: Mapped[int] = mapped_column(Integer, default=12)
    status: Mapped[CreditStatus] = mapped_column(Enum(CreditStatus), default=CreditStatus.draft)
    monthly_payment_minor: Mapped[int] = mapped_column(BigInteger, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="credits")
