from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..db import get_db
from ..deps import get_current_user
from ..models import Quote, Holding, WatchlistItem, User
from ..schemas import QuoteOut, HoldingOut, TradeIn

router = APIRouter(prefix="/investments", tags=["investments"])


@router.get("/quotes", response_model=list[QuoteOut])
def all_quotes(db: Session = Depends(get_db)):
    return db.scalars(select(Quote).order_by(Quote.ticker)).all()


@router.get("/portfolio", response_model=list[HoldingOut])
def portfolio(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Holding).where(Holding.user_id == user.id)).all()


@router.post("/trade", response_model=HoldingOut, status_code=201)
def trade(payload: TradeIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    quote = db.get(Quote, payload.ticker)
    if not quote:
        raise HTTPException(404, "Unknown ticker")
    holding = db.scalar(select(Holding).where(Holding.user_id == user.id, Holding.ticker == payload.ticker))
    if payload.side == "buy":
        if holding:
            total_cost = holding.avg_price_minor * float(holding.quantity) + quote.price_minor * payload.quantity
            holding.quantity = float(holding.quantity) + payload.quantity
            holding.avg_price_minor = int(total_cost / float(holding.quantity)) if holding.quantity else 0
        else:
            holding = Holding(
                user_id=user.id,
                ticker=payload.ticker,
                quantity=payload.quantity,
                avg_price_minor=quote.price_minor,
            )
            db.add(holding)
    else:  # sell
        if not holding or float(holding.quantity) < payload.quantity:
            raise HTTPException(400, "Not enough shares")
        holding.quantity = float(holding.quantity) - payload.quantity
        if float(holding.quantity) == 0:
            db.delete(holding)
            db.commit()
            return HoldingOut(id=0, ticker=payload.ticker, quantity=0, avg_price_minor=0)
    db.commit()
    db.refresh(holding)
    return holding


@router.get("/watchlist", response_model=list[QuoteOut])
def watchlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.scalars(
        select(WatchlistItem).where(WatchlistItem.user_id == user.id).order_by(WatchlistItem.position)
    ).all()
    return [i.quote for i in items if i.quote]


@router.post("/watchlist/{ticker}", status_code=201)
def add_watch(ticker: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not db.get(Quote, ticker):
        raise HTTPException(404, "Unknown ticker")
    existing = db.scalar(select(WatchlistItem).where(WatchlistItem.user_id == user.id, WatchlistItem.ticker == ticker))
    if existing:
        return {"ok": True}
    db.add(WatchlistItem(user_id=user.id, ticker=ticker))
    db.commit()
    return {"ok": True}


@router.delete("/watchlist/{ticker}", status_code=204)
def remove_watch(ticker: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.scalar(select(WatchlistItem).where(WatchlistItem.user_id == user.id, WatchlistItem.ticker == ticker))
    if item:
        db.delete(item)
        db.commit()
