from pydantic import BaseModel, Field
from typing import Optional

class ExtractedEntities(BaseModel):
    project_id: Optional[str] = None
    plant_unit: Optional[str] = None
    area: Optional[str] = None
    discipline: Optional[str] = None
    asset_id: Optional[str] = None
    action: Optional[str] = None
    progress_percent: Optional[float] = None
    status: Optional[str] = None
    delay_days: Optional[int] = None
    delay_root_cause: Optional[str] = None
    expected_completion_date: Optional[str] = None
    
class ExtractionResult(BaseModel):
    entities: ExtractedEntities
    confidence: float
