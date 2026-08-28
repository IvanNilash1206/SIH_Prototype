from abc import ABC, abstractmethod
from app.schemas.extraction import ExtractedEntities, ExtractionResult
import re

class ExtractionProvider(ABC):
    @abstractmethod
    def extract(self, text: str, project_id: str = None) -> ExtractionResult:
        pass

class MockExtractionProvider(ExtractionProvider):
    def extract(self, text: str, project_id: str = None) -> ExtractionResult:
        # Deterministic extraction based on golden report keywords
        text_lower = text.lower()
        
        entities = ExtractedEntities(project_id=project_id)
        confidence = 0.95
        
        # Golden match simulation
        if "p-204" in text_lower or "p204" in text_lower:
            entities.asset_id = "P-204"
            if "installation" in text_lower:
                entities.action = "MECHANICAL_INSTALLATION"
                entities.discipline = "Mechanical"
        else:
            # Ambiguity scenario simulation
            if "pump area" in text_lower:
                entities.asset_id = None
                confidence = 0.60
                
        if "cdu unit 2" in text_lower or "cdu-02" in text_lower:
            entities.plant_unit = "CDU-02"
            
        # Extract progress
        # simple regex for %
        match = re.search(r'(\d+)\s*(percent|%)', text_lower)
        if match:
            entities.progress_percent = float(match.group(1))
            entities.status = "IN_PROGRESS"
            
        # Extract delays
        delay_match = re.search(r'(\d+)\s*din\s*delay', text_lower) or re.search(r'(\d+)\s*days?\s*delay', text_lower)
        if delay_match:
            entities.delay_days = int(delay_match.group(1))
            
        if "material" in text_lower:
            entities.delay_root_cause = "MATERIAL_DELIVERY"
            
        return ExtractionResult(entities=entities, confidence=confidence)

class LLMExtractionProvider(ExtractionProvider):
    def extract(self, text: str, project_id: str = None) -> ExtractionResult:
        # For prototype, if AI_API_KEY is missing, fall back to mock
        import os
        if not os.getenv("AI_API_KEY"):
            print("No AI_API_KEY found, falling back to mock provider")
            return MockExtractionProvider().extract(text, project_id)
            
        # In a real implementation, we would call an LLM API here.
        # Returning mock for now to ensure the golden path works deterministically
        return MockExtractionProvider().extract(text, project_id)
