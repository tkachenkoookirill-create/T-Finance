from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_

from ..db import get_db
from ..deps import get_current_user
from ..models import Account, Transaction, Category, User
from ..schemas import CategorySpend, MonthlyPoint

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/categories", response_model=list[CategorySpend])
def spend_by_category(
    days: int = 30,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    q = (
        select(
            Category.key,
            Category.label_ru,
            Category.color_token,
            func.coalesce(func.sum(-Transaction.amount_minor), 0).label("v"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .join(Account, Account.id == Transaction.account_id)
        .where(
            Account.user_id == user.id,
            Transaction.amount_minor < 0,
            Transaction.occurred_at >= since,
        )
        .group_by(Category.key, Category.label_ru, Category.color_token)
        .order_by(func.sum(-Transaction.amount_minor).desc())
    )
    out = []
    for key, label, color, v in db.execute(q).all():
        out.append(CategorySpend(key=key, label=label, color_token=color, value_minor=int(v or 0)))
    return out


@router.get("/monthly", response_model=list[MonthlyPoint])
def monthly_flow(
    months: int = 12,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(days=31 * months)
    q = (
        select(
            func.to_char(Transaction.occurred_at, "YYYY-MM").label("m"),
            func.coalesce(func.sum(
                func.greatest(Transaction.amount_minor, 0)
            ), 0).label("inflow"),
            func.coalesce(func.sum(
                func.least(Transaction.amount_minor, 0)
            ), 0).label("outflow"),
        )
        .join(Account, Account.id == Transaction.account_id)
        .where(Account.user_id == user.id, Transaction.occurred_at >= since)
        .group_by("m")
        .order_by("m")
    )
    out = []
    for m, inflow, outflow in db.execute(q).all():
        out.append(MonthlyPoint(month=m, inflow_minor=int(inflow or 0), outflow_minor=int(-outflow or 0)))
    return out


@router.get("/net-worth")
def net_worth(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    total = db.scalar(
        select(func.coalesce(func.sum(Account.balance_minor), 0)).where(Account.user_id == user.id)
    ) or 0
    return {"net_worth_minor": int(total), "currency": "RUB"}
