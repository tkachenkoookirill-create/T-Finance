from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..db import get_db
from ..deps import get_current_user
from ..models import Credit, CreditStatus, User
from ..schemas import CreditApplicationIn, CreditOut

router = APIRouter(prefix="/credits", tags=["credits"])


# Per-product nominal annual rates (basis for demo). Real product would
# tie this to risk model + key rate.
_PRODUCT_RATES = {
    "cash": 18.9,
    "mortgage": 12.4,
    "card": 23.5,
    "deposit": -12.4,  # negative = bank pays you
}


def _monthly_payment(principal_minor: int, annual_pct: float, months: int) -> int:
    if months <= 0 or annual_pct == 0:
        return principal_minor // max(months, 1)
    r = abs(annual_pct) / 100 / 12
    pmt = principal_minor * r / (1 - (1 + r) ** -months)
    return int(round(pmt))


@router.get("", response_model=list[CreditOut])
def my_credits(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Credit).where(Credit.user_id == user.id).order_by(Credit.id.desc())).all()


@router.post("/apply", response_model=CreditOut, status_code=201)
def apply(payload: CreditApplicationIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.product not in _PRODUCT_RATES:
        raise HTTPException(400, "Unknown product")
    rate = _PRODUCT_RATES[payload.product]
    monthly = _monthly_payment(payload.principal_minor, rate, payload.term_months)
    credit = Credit(
        user_id=user.id,
        product=payload.product,
        principal_minor=payload.principal_minor,
        rate_pct=rate,
        term_months=payload.term_months,
        status=CreditStatus.pending,
        monthly_payment_minor=monthly,
    )
    db.add(credit)
    db.commit()
    db.refresh(credit)
    return credit
