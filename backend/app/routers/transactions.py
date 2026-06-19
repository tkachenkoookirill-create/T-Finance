from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from ..db import get_db
from ..deps import get_current_user
from ..models import Account, Transaction, Category, TxDirection, User
from ..schemas import TransactionIn, TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _to_out(tx: Transaction) -> dict:
    return {
        "id": tx.id,
        "account_id": tx.account_id,
        "amount_minor": tx.amount_minor,
        "direction": tx.direction.value if hasattr(tx.direction, "value") else tx.direction,
        "merchant": tx.merchant,
        "note": tx.note,
        "is_recurring": tx.is_recurring,
        "occurred_at": tx.occurred_at,
        "category_key": tx.category.key if tx.category else None,
    }


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    account_id: int | None = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(Transaction).join(Account).where(Account.user_id == user.id)
    if account_id:
        q = q.where(Transaction.account_id == account_id)
    q = q.order_by(Transaction.occurred_at.desc()).limit(limit).offset(offset)
    rows = db.scalars(q).all()
    return [_to_out(t) for t in rows]


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(payload: TransactionIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    acc = db.get(Account, payload.account_id)
    if not acc or acc.user_id != user.id:
        raise HTTPException(404, "Account not found")

    category = None
    if payload.category_key:
        category = db.scalar(select(Category).where(Category.key == payload.category_key))

    tx = Transaction(
        account_id=payload.account_id,
        category_id=category.id if category else None,
        amount_minor=payload.amount_minor,
        direction=TxDirection(payload.direction),
        merchant=payload.merchant,
        note=payload.note,
        is_recurring=payload.is_recurring,
        occurred_at=payload.occurred_at or datetime.now(timezone.utc),
    )
    acc.balance_minor += payload.amount_minor
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return _to_out(tx)


@router.delete("/{tx_id}", status_code=204)
def delete_tx(tx_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tx = db.get(Transaction, tx_id)
    if not tx:
        raise HTTPException(404)
    acc = db.get(Account, tx.account_id)
    if not acc or acc.user_id != user.id:
        raise HTTPException(404)
    acc.balance_minor -= tx.amount_minor
    db.delete(tx)
    db.commit()
