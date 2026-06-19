import enum
from datetime import datetime
from sqlalchemy import String, Integer, BigInteger, Boolean, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class TxDirection(str, enum.Enum):
    inflow = "inflow"
    outflow = "outflow"
    transfer = "transfer"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    # Signed: positive = inflow, negative = outflow (in minor units)
    amount_minor: Mapped[int] = mapped_column(BigInteger, nullable=False)
    direction: Mapped[TxDirection] = mapped_column(Enum(TxDirection), default=TxDirection.outflow)
    merchant: Mapped[str] = mapped_column(String(160), default="")
    note: Mapped[str] = mapped_column(String(500), default="")
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    # Transfer mirroring — pair of transactions share a transfer_group_id
    transfer_group_id: Mapped[str | None] = mapped_column(String(40), index=True, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="transactions")
    category = relationship("Category")
