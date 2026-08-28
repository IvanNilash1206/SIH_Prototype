from pydantic import BaseModel
from typing import List, Optional

class CandidateMatch(BaseModel):
    activity_id: str
    activity_code: str
    name: str
    rank: int
    confidence: float
    asset_score: float
    location_score: float
    discipline_score: float
    action_score: float
    semantic_score: float

class MatchExplanation(BaseModel):
    reasons: List[str]

class MatchResultSchema(BaseModel):
    candidates: List[CandidateMatch]
    decision: str
    explanation: MatchExplanation
