import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import Account, Transaction, TxDirection, User
from ..schemas import TransferIn

router = APIRouter(prefix="/transfers", tags=["transfers"])


@router.post("", status_code=201)
def transfer(payload: TransferIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    src = db.get(Account, payload.from_account_id)
    dst = db.get(Account, payload.to_account_id)
    if not src or not dst or src.user_id != user.id or dst.user_id != user.id:
        raise HTTPException(404, "Account not found")
    if src.id == dst.id:
        raise HTTPException(400, "Same account")
    if src.balance_minor < payload.amount_minor:
        raise HTTPException(400, "Insufficient funds")
    if src.currency != dst.currency:
        # NOTE: real FX conversion would go through a rates service.
        raise HTTPException(400, "FX transfers not yet supported — use Exchange")

    group = uuid.uuid4().hex
    now = datetime.now(timezone.utc)
    out_tx = Transaction(
        account_id=src.id,
        amount_minor=-payload.amount_minor,
        direction=TxDirection.transfer,
        merchant=f"→ {dst.label}",
        note=payload.note,
        transfer_group_id=group,
        occurred_at=now,
    )
    in_tx = Transaction(
        account_id=dst.id,
        amount_minor=payload.amount_minor,
        direction=TxDirection.transfer,
        merchant=f"← {src.label}",
        note=payload.note,
        transfer_group_id=group,
        occurred_at=now,
    )
    src.balance_minor -= payload.amount_minor
    dst.balance_minor += payload.amount_minor
    db.add_all([out_tx, in_tx])
    db.commit()
    return {"group": group, "from": src.id, "to": dst.id, "amount_minor": payload.amount_minor}
