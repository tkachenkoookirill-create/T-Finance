from datetime import datetime, date
from sqlalchemy import String, BigInteger, DateTime, Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(120))
    target_minor: Mapped[int] = mapped_column(BigInteger, default=0)
    current_minor: Mapped[int] = mapped_column(BigInteger, default=0)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="goals")
