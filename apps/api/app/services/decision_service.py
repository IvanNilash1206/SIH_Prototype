from sqlalchemy.orm import Session
from app.models.domain import FieldReport, MatchResult, Activity, AuditEvent, DelayEvent, PlannerReview, Extraction
import json

def process_decision_and_sync(report_id: str, db: Session):
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        return
        
    match_result = db.query(MatchResult).filter(MatchResult.report_id == report_id).order_by(MatchResult.rank.asc()).first()
    extraction = db.query(Extraction).filter(Extraction.report_id == report_id).first()
    
    if not match_result or not extraction:
        report.processing_status = "FAILED"
        db.commit()
        return
        
    decision = match_result.decision
    
    if decision == "AUTO_SYNC":
        activity = db.query(Activity).filter(Activity.id == match_result.activity_id).first()
        if activity:
            old_progress = activity.actual_progress
            new_progress = extraction.progress_percent if extraction.progress_percent is not None else old_progress
            
            # Apply bounds
            new_progress = max(0.0, min(100.0, float(new_progress)))
            
            activity.actual_progress = new_progress
            if new_progress == 100.0:
                activity.status = "COMPLETED"
            elif new_progress > 0.0:
                activity.status = "IN_PROGRESS"
                
            # Audit Event
            audit = AuditEvent(
                project_id=report.project_id,
                report_id=report.id,
                activity_id=activity.id,
                actor_type="SYSTEM",
                event_type="UPDATE_PROGRESS",
                old_value_json={"actual_progress": old_progress},
                new_value_json={"actual_progress": new_progress},
                confidence=match_result.confidence,
                decision="AUTO_SYNC",
                reason="High confidence AI match"
            )
            db.add(audit)
            
            # Delay Event
            if extraction.delay_days and extraction.delay_days > 0:
                activity.is_delayed = True
                delay = DelayEvent(
                    project_id=report.project_id,
                    activity_id=activity.id,
                    report_id=report.id,
                    delay_days=extraction.delay_days,
                    root_cause=extraction.delay_root_cause or "OTHER",
                    description=f"Delay detected from field report"
                )
                db.add(delay)
                
            report.processing_status = "AUTO_SYNCED"
            db.commit()
            
    elif decision == "HUMAN_REVIEW":
        review = PlannerReview(
            report_id=report.id,
            decision="PENDING"
        )
        db.add(review)
        report.processing_status = "AWAITING_REVIEW"
        db.commit()
