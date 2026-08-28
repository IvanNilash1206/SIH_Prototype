from sqlalchemy.orm import Session
from app.models.domain import FieldReport, Extraction
from app.providers.extraction_provider import MockExtractionProvider, LLMExtractionProvider
import os

def get_extraction_provider():
    # Factory for provider
    if os.getenv("OPENROUTER_API_KEY"):
        return LLMExtractionProvider()
    return MockExtractionProvider()

def process_report_extraction(report_id: str, db: Session):
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        return None
        
    report.processing_status = "EXTRACTING"
    db.commit()
    
    provider = get_extraction_provider()
    result = provider.extract(report.raw_text, report.project_id)
    
    # Save extraction
    db_extraction = Extraction(
        report_id=report.id,
        discipline=result.entities.discipline,
        plant_unit=result.entities.plant_unit,
        area=result.entities.area,
        asset_id=result.entities.asset_id,
        action=result.entities.action,
        progress_percent=result.entities.progress_percent,
        status=result.entities.status,
        delay_days=result.entities.delay_days,
        delay_root_cause=result.entities.delay_root_cause,
        raw_json=result.entities.model_dump(),
        extraction_confidence=result.confidence
    )
    
    db.add(db_extraction)
    
    report.processing_status = "EXTRACTED"
    db.commit()
    db.refresh(db_extraction)
    
    return db_extraction
