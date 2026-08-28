from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.domain import FieldReport
from app.schemas.report import ReportCreate, ReportResponse
from typing import List

from app.services.extraction_service import process_report_extraction
from app.services.matching_service import process_report_matching
from app.services.decision_service import process_decision_and_sync

router = APIRouter()

def process_pipeline(report_id: str, db: Session):
    try:
        extraction = process_report_extraction(report_id, db)
        if extraction:
            decision = process_report_matching(report_id, db)
            if decision:
                process_decision_and_sync(report_id, db)
    except Exception as e:
        print(f"Pipeline error for report {report_id}: {e}")
        report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
        if report:
            report.processing_status = "FAILED"
            db.commit()

@router.post("/", response_model=ReportResponse)
def create_report(report: ReportCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_report = FieldReport(
        project_id=report.project_id,
        submitted_by=report.submitted_by,
        source_type=report.source_type,
        raw_text=report.raw_text,
        processing_status="RECEIVED"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    background_tasks.add_task(process_pipeline, db_report.id, db)
    
    return db_report

@router.get("/", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    return db.query(FieldReport).order_by(FieldReport.created_at.desc()).all()

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
