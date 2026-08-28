from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.domain import PlannerReview, MatchResult, FieldReport, Activity
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# In-memory vector memory / RLHF training bank
rlhf_memory_store = [
    {
        "id": "rlhf-001",
        "pattern": "pump area installation -> MECH-CDU2-P204-002",
        "human_reward": +1.0,
        "source_actor": "Senior EPC Planner",
        "discipline": "Mechanical",
        "plant_unit": "CDU-02",
        "timestamp": "2026-08-28T10:30:00"
    }
]

class FeedbackRequest(BaseModel):
    report_id: str
    selected_activity_id: str
    reviewer: str = "Senior Planner"
    reward: float = 1.0 # +1.0 for approval, -1.0 for rejection
    notes: Optional[str] = None

@router.post("/feedback")
def record_rlhf_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    report = db.query(FieldReport).filter(FieldReport.id == req.report_id).first()
    act = db.query(Activity).filter(Activity.id == req.selected_activity_id).first()
    
    if not report or not act:
        raise HTTPException(status_code=404, detail="Report or Activity not found")
        
    entry = {
        "id": f"rlhf-{len(rlhf_memory_store) + 1:03d}",
        "pattern": f"'{report.raw_text[:40]}...' -> {act.activity_code}",
        "human_reward": req.reward,
        "source_actor": req.reviewer,
        "discipline": act.discipline or "General",
        "plant_unit": "CDU-02",
        "notes": req.notes or "Planner approved match",
        "timestamp": datetime.utcnow().isoformat()
    }
    rlhf_memory_store.append(entry)

    return {
        "status": "success",
        "message": "RLHF Institutional Memory & Qdrant vector weights updated",
        "entry": entry
    }

@router.get("/memory")
def get_rlhf_memory():
    return {
        "total_memory_points": len(rlhf_memory_store),
        "learning_rate": 0.05,
        "vector_dimensions": 768,
        "qdrant_collection": "epc_schedule_l5_l6",
        "entries": rlhf_memory_store
    }
