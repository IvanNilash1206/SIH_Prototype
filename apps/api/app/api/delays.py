from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database import get_db
from app.models.domain import DelayEvent, Activity
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class DelayEventResponse(BaseModel):
    id: str
    activity_code: str
    activity_name: str
    report_id: str
    delay_days: int
    root_cause: str
    description: str
    created_at: datetime

@router.get("/", response_model=List[DelayEventResponse])
def get_delays(db: Session = Depends(get_db)):
    events = db.query(DelayEvent).order_by(desc(DelayEvent.created_at)).all()
    result = []
    
    for event in events:
        activity_code = "UNKNOWN"
        activity_name = "Unknown Activity"
        
        act = db.query(Activity).filter(Activity.id == event.activity_id).first()
        if act:
            activity_code = act.activity_code
            activity_name = act.name
            
        result.append({
            "id": event.id,
            "activity_code": activity_code,
            "activity_name": activity_name,
            "report_id": event.report_id,
            "delay_days": event.delay_days,
            "root_cause": event.root_cause,
            "description": event.description,
            "created_at": event.created_at
        })
        
    return result
