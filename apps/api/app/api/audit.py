from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database import get_db
from app.models.domain import AuditEvent, Activity, FieldReport
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class AuditEventResponse(BaseModel):
    id: str
    project_id: str
    report_id: Optional[str]
    activity_id: Optional[str]
    activity_code: Optional[str]
    activity_name: Optional[str]
    actor_type: str
    actor_id: Optional[str]
    event_type: str
    old_value_json: dict
    new_value_json: dict
    confidence: Optional[float]
    decision: Optional[str]
    reason: str
    created_at: datetime

@router.get("/", response_model=List[AuditEventResponse])
def get_audit_events(db: Session = Depends(get_db)):
    events = db.query(AuditEvent).order_by(desc(AuditEvent.created_at)).all()
    result = []
    
    for event in events:
        activity_code = None
        activity_name = None
        
        if event.activity_id:
            act = db.query(Activity).filter(Activity.id == event.activity_id).first()
            if act:
                activity_code = act.activity_code
                activity_name = act.name
                
        result.append({
            "id": event.id,
            "project_id": event.project_id,
            "report_id": event.report_id,
            "activity_id": event.activity_id,
            "activity_code": activity_code,
            "activity_name": activity_name,
            "actor_type": event.actor_type,
            "actor_id": event.actor_id,
            "event_type": event.event_type,
            "old_value_json": event.old_value_json or {},
            "new_value_json": event.new_value_json or {},
            "confidence": event.confidence,
            "decision": event.decision,
            "reason": event.reason,
            "created_at": event.created_at
        })
        
    return result
