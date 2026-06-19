from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(40), unique=True, index=True)  # e.g. 'food'
    label_ru: Mapped[str] = mapped_column(String(60))
    label_en: Mapped[str] = mapped_column(String(60))
    color_token: Mapped[str] = mapped_column(String(40), default="var(--c7)")
    kind: Mapped[str] = mapped_column(String(20), default="expense")  # expense|income|transfer
