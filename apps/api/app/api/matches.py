from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database import get_db
from app.models.domain import MatchResult, Activity, FieldReport
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class MatchResponse(BaseModel):
    id: str
    report_id: str
    activity_id: str
    activity_code: str
    activity_name: str
    rank: int
    confidence: float
    asset_score: float
    location_score: float
    discipline_score: float
    action_score: float
    semantic_score: float
    decision: str
    explanation: dict
    created_at: datetime

@router.get("/", response_model=List[MatchResponse])
def get_matches(db: Session = Depends(get_db)):
    matches = db.query(MatchResult).order_by(desc(MatchResult.created_at)).limit(50).all()
    result = []
    
    for m in matches:
        act = db.query(Activity).filter(Activity.id == m.activity_id).first()
        result.append({
            "id": m.id,
            "report_id": m.report_id,
            "activity_id": m.activity_id,
            "activity_code": act.activity_code if act else "UNKNOWN",
            "activity_name": act.name if act else "Unknown",
            "rank": m.rank,
            "confidence": m.confidence,
            "asset_score": m.asset_score,
            "location_score": m.location_score,
            "discipline_score": m.discipline_score,
            "action_score": m.action_score,
            "semantic_score": m.semantic_score,
            "decision": m.decision,
            "explanation": m.explanation_json,
            "created_at": m.created_at
        })
        
    return result
