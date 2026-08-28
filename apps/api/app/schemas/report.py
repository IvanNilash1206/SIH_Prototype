from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ReportCreate(BaseModel):
    project_id: str
    submitted_by: str
    source_type: str
    raw_text: str

class ReportResponse(BaseModel):
    id: str
    project_id: str
    submitted_by: str
    source_type: str
    raw_text: str
    transcript: Optional[str]
    file_reference: Optional[str]
    report_date: datetime
    processing_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
