from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..db import get_db
from ..deps import get_current_user
from ..models import Goal, User
from ..schemas import GoalIn, GoalOut

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalOut])
def list_goals(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Goal).where(Goal.user_id == user.id).order_by(Goal.id)).all()


@router.post("", response_model=GoalOut, status_code=201)
def create_goal(payload: GoalIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    goal = Goal(user_id=user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    g = db.get(Goal, goal_id)
    if not g or g.user_id != user.id:
        raise HTTPException(404)
    db.delete(g)
    db.commit()
