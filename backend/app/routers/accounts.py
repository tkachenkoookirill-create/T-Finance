from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..db import get_db
from ..deps import get_current_user
from ..models import Account, User
from ..schemas import AccountIn, AccountOut

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(select(Account).where(Account.user_id == user.id).order_by(Account.id)).all()
    return rows


@router.post("", response_model=AccountOut, status_code=201)
def create_account(payload: AccountIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    acc = Account(user_id=user.id, **payload.model_dump())
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


@router.get("/{account_id}", response_model=AccountOut)
def get_account(account_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    acc = db.get(Account, account_id)
    if not acc or acc.user_id != user.id:
        raise HTTPException(404)
    return acc


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    acc = db.get(Account, account_id)
    if not acc or acc.user_id != user.id:
        raise HTTPException(404)
    db.delete(acc)
    db.commit()
