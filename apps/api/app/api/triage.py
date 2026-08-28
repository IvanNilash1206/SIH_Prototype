from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database import get_db
from app.models.domain import FieldReport, MatchResult, Extraction, Activity, PlannerReview, AuditEvent, DelayEvent
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class TriageReportResponse(BaseModel):
    report_id: str
    project_id: str
    raw_text: str
    extraction: dict
    match_candidates: List[dict]

class ApproveRequest(BaseModel):
    activity_id: str
    reviewer: str = "System Planner"
    comment: Optional[str] = None

@router.get("/", response_model=List[TriageReportResponse])
def get_pending_triage(db: Session = Depends(get_db)):
    reports = db.query(FieldReport).filter(FieldReport.processing_status == "AWAITING_REVIEW").all()
    result = []
    for report in reports:
        ext = db.query(Extraction).filter(Extraction.report_id == report.id).first()
        matches = db.query(MatchResult).filter(MatchResult.report_id == report.id).order_by(MatchResult.rank.asc()).all()
        
        candidates = []
        for m in matches:
            act = db.query(Activity).filter(Activity.id == m.activity_id).first()
            if act:
                candidates.append({
                    "id": m.id,
                    "activity_id": act.id,
                    "activity_name": act.name,
                    "activity_code": act.activity_code,
                    "confidence": m.confidence,
                    "rank": m.rank,
                    "explanation": m.explanation_json
                })
        
        result.append({
            "report_id": report.id,
            "project_id": report.project_id,
            "raw_text": report.raw_text,
            "extraction": ext.raw_json if ext else {},
            "match_candidates": candidates
        })
    return result

@router.post("/{report_id}/approve")
def approve_triage(report_id: str, req: ApproveRequest, db: Session = Depends(get_db)):
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report or report.processing_status != "AWAITING_REVIEW":
        raise HTTPException(status_code=404, detail="Report not found or not awaiting review")
        
    ext = db.query(Extraction).filter(Extraction.report_id == report.id).first()
    act = db.query(Activity).filter(Activity.id == req.activity_id).first()
    
    if not act or not ext:
        raise HTTPException(status_code=404, detail="Activity or Extraction not found")
        
    # Update PlannerReview
    review = db.query(PlannerReview).filter(PlannerReview.report_id == report_id, PlannerReview.decision == "PENDING").first()
    if review:
        review.decision = "APPROVED"
        review.selected_activity_id = req.activity_id
        review.reviewer = req.reviewer
        review.comment = req.comment
        from datetime import datetime
        review.reviewed_at = datetime.utcnow()
    
    # Update Activity Progress
    old_progress = act.actual_progress
    new_progress = ext.progress_percent if ext.progress_percent is not None else old_progress
    new_progress = max(0.0, min(100.0, float(new_progress)))
    
    act.actual_progress = new_progress
    if new_progress == 100.0:
        act.status = "COMPLETED"
    elif new_progress > 0.0:
        act.status = "IN_PROGRESS"
        
    # Audit Event
    audit = AuditEvent(
        project_id=report.project_id,
        report_id=report.id,
        activity_id=act.id,
        actor_type="USER",
        actor_id=req.reviewer,
        event_type="UPDATE_PROGRESS",
        old_value_json={"actual_progress": old_progress},
        new_value_json={"actual_progress": new_progress},
        decision="HUMAN_REVIEW",
        reason=req.comment or "Planner approved match"
    )
    db.add(audit)
    
    # Delay Event
    if ext.delay_days and ext.delay_days > 0:
        act.is_delayed = True
        delay = DelayEvent(
            project_id=report.project_id,
            activity_id=act.id,
            report_id=report.id,
            delay_days=ext.delay_days,
            root_cause=ext.delay_root_cause or "OTHER",
            description=f"Delay detected from field report (Planner Verified)"
        )
        db.add(delay)
        
    report.processing_status = "SYNCED"
    db.commit()
    return {"status": "success"}

@router.post("/{report_id}/reject")
def reject_triage(report_id: str, db: Session = Depends(get_db)):
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report or report.processing_status != "AWAITING_REVIEW":
        raise HTTPException(status_code=404, detail="Report not found or not awaiting review")
        
    review = db.query(PlannerReview).filter(PlannerReview.report_id == report_id, PlannerReview.decision == "PENDING").first()
    if review:
        review.decision = "REJECTED"
        from datetime import datetime
        review.reviewed_at = datetime.utcnow()
        
    report.processing_status = "REJECTED"
    db.commit()
    return {"status": "success"}
