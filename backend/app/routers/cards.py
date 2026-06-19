import random
import string
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..db import get_db
from ..deps import get_current_user
from ..models import Card, CardStatus, CardType, Account, User
from ..schemas import CardIn, CardOut, CardStatusIn

router = APIRouter(prefix="/cards", tags=["cards"])


def _gen_last4() -> str:
    return "".join(random.choices(string.digits, k=4))


@router.get("", response_model=list[CardOut])
def list_cards(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Card).where(Card.user_id == user.id).order_by(Card.id)).all()


@router.post("", response_model=CardOut, status_code=201)
def issue_card(payload: CardIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    acc = db.get(Account, payload.account_id)
    if not acc or acc.user_id != user.id:
        raise HTTPException(404, "Account not found")
    card = Card(
        user_id=user.id,
        account_id=payload.account_id,
        type=CardType(payload.type),
        status=CardStatus.active,
        label=payload.label,
        last4=_gen_last4(),
        expiry=date.today() + timedelta(days=365 * 4),
        daily_limit_minor=payload.daily_limit_minor,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.patch("/{card_id}/status", response_model=CardOut)
def set_status(card_id: int, payload: CardStatusIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    card = db.get(Card, card_id)
    if not card or card.user_id != user.id:
        raise HTTPException(404)
    card.status = CardStatus(payload.status)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=204)
def close_card(card_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    card = db.get(Card, card_id)
    if not card or card.user_id != user.id:
        raise HTTPException(404)
    card.status = CardStatus.closed
    db.commit()
