from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.domain import Activity
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ActivityResponse(BaseModel):
    id: str
    activity_code: str
    name: str
    discipline: Optional[str]
    area: Optional[str]
    planned_start: Optional[datetime]
    planned_finish: Optional[datetime]
    baseline_progress: float
    actual_progress: float
    status: str
    is_delayed: bool

@router.get("/", response_model=List[ActivityResponse])
def get_activities(db: Session = Depends(get_db)):
    return db.query(Activity).all()
