from abc import ABC, abstractmethod
from app.schemas.extraction import ExtractedEntities, ExtractionResult
import re

class ExtractionProvider(ABC):
    @abstractmethod
    def extract(self, text: str, project_id: str = None) -> ExtractionResult:
        pass

class MockExtractionProvider(ExtractionProvider):
    def extract(self, text: str, project_id: str = None) -> ExtractionResult:
        text_lower = text.lower()
        entities = ExtractedEntities(project_id=project_id)
        confidence = 0.95
        
        # 1. Asset Detection
        asset_match = re.search(r'\b(p-?\d+|v-?\d+|hx-?\d+|tk-?\d+|ep-?\d+|f-?\d+)\b', text_lower)
        if asset_match:
            raw_asset = asset_match.group(1).upper()
            if "-" not in raw_asset:
                raw_asset = raw_asset[0] + "-" + raw_asset[1:] if raw_asset[0].isalpha() else raw_asset
                # handle formats like HX201 -> HX-201, EP07 -> EP-07, TK301 -> TK-301
                if raw_asset.startswith(('P', 'V', 'F')) and len(raw_asset) > 1 and raw_asset[1] != '-':
                    raw_asset = raw_asset[0] + '-' + raw_asset[1:]
                elif raw_asset.startswith(('HX', 'TK', 'EP')) and len(raw_asset) > 2 and raw_asset[2] != '-':
                    raw_asset = raw_asset[:2] + '-' + raw_asset[2:]
            entities.asset_id = raw_asset
        else:
            if "pump" in text_lower or "area" in text_lower or "unit" in text_lower:
                entities.asset_id = None
                confidence = 0.60

        # 2. Plant Unit Detection
        if "cdu-01" in text_lower or "cdu 1" in text_lower or "unit 1" in text_lower:
            entities.plant_unit = "CDU-01"
        elif "cdu-02" in text_lower or "cdu unit 2" in text_lower or "unit 2" in text_lower or "cdu 2" in text_lower:
            entities.plant_unit = "CDU-02"
        elif "cdu-03" in text_lower or "cdu 3" in text_lower or "unit 3" in text_lower:
            entities.plant_unit = "CDU-03"
        elif "tank farm" in text_lower or "tank-farm" in text_lower:
            entities.plant_unit = "TANK-FARM"
        elif "control room" in text_lower or "control-room" in text_lower:
            entities.plant_unit = "CONTROL-ROOM"
        elif "utilities" in text_lower:
            entities.plant_unit = "UTILITIES"

        # 3. Area Detection
        if "pump area" in text_lower:
            entities.area = "Pump Area"
        elif "pipe rack" in text_lower:
            entities.area = "Pipe Rack"
        elif "control room" in text_lower:
            entities.area = "Control Room"

        # 4. Discipline & Action Detection
        if any(w in text_lower for w in ["mechanical", "pump", "alignment", "machinery", "equipment"]):
            entities.discipline = "Mechanical"
            if "alignment" in text_lower:
                entities.action = "ALIGNMENT"
            elif "testing" in text_lower or "test" in text_lower:
                entities.action = "TESTING"
            elif "commissioning" in text_lower:
                entities.action = "COMMISSIONING"
            elif "installation" in text_lower or "install" in text_lower:
                entities.action = "MECHANICAL_INSTALLATION"
            elif "foundation" in text_lower:
                entities.action = "FOUNDATION_PREPARATION"
        elif any(w in text_lower for w in ["civil", "concrete", "pour", "foundation", "rebar", "formwork"]):
            entities.discipline = "Civil"
            if "pour" in text_lower or "concrete" in text_lower:
                entities.action = "CONCRETE_POURING"
            elif "rebar" in text_lower:
                entities.action = "REBAR_INSTALLATION"
            elif "formwork" in text_lower:
                entities.action = "FORMWORK"
            elif "foundation" in text_lower:
                entities.action = "FOUNDATION_PREPARATION"
        elif any(w in text_lower for w in ["electrical", "cable", "panel", "termination", "tray", "switchgear"]):
            entities.discipline = "Electrical"
            if "termination" in text_lower:
                entities.action = "TERMINATION"
            elif "tray" in text_lower:
                entities.action = "CABLE_TRAY_INSTALLATION"
            elif "pulling" in text_lower:
                entities.action = "CABLE_PULLING"
            elif "loop" in text_lower:
                entities.action = "LOOP_CHECKING"
        elif any(w in text_lower for w in ["piping", "spool", "weld", "welding", "hydrotest", "ndt"]):
            entities.discipline = "Piping"
            if "spool" in text_lower or "erection" in text_lower:
                entities.action = "SPOOL_ERECTION"
            elif "weld" in text_lower:
                entities.action = "WELDING"
            elif "hydrotest" in text_lower:
                entities.action = "HYDROTESTING"
        elif any(w in text_lower for w in ["instrumentation", "sensor", "transmitter", "calibration"]):
            entities.discipline = "Instrumentation"
            if "calibration" in text_lower:
                entities.action = "INSTRUMENT_CALIBRATION"
            elif "mounting" in text_lower:
                entities.action = "MOUNTING"

        # 5. Progress Percentage
        prog_match = re.search(r'(\d+)\s*(?:percent|%|pratishat)', text_lower)
        if prog_match:
            entities.progress_percent = float(prog_match.group(1))
            if entities.progress_percent >= 100.0:
                entities.status = "COMPLETED"
            elif entities.progress_percent > 0:
                entities.status = "IN_PROGRESS"
            else:
                entities.status = "NOT_STARTED"
        elif "complete" in text_lower or "ho gaya" in text_lower or "done" in text_lower:
            entities.progress_percent = 100.0
            entities.status = "COMPLETED"

        # 6. Delays & Root Cause
        delay_match = re.search(r'(\d+)\s*(?:din|days?|hours?)\s*delay', text_lower) or re.search(r'delay(?:ed)?\s*(?:by\s*)?(\d+)\s*(?:din|days?)', text_lower)
        if delay_match:
            entities.delay_days = int(delay_match.group(1))
        elif any(w in text_lower for w in ["delay", "ruk gaya", "hold", "stalled", "stopped"]):
            entities.delay_days = 2

        if any(w in text_lower for w in ["material", "delivery", "gasket", "spares", "supply"]):
            entities.delay_root_cause = "MATERIAL_DELIVERY"
        elif any(w in text_lower for w in ["labour", "labor", "manpower", "workers", "crew"]):
            entities.delay_root_cause = "LABOUR_SHORTAGE"
        elif any(w in text_lower for w in ["equipment", "crane", "breakdown", "machine", "failure"]):
            entities.delay_root_cause = "EQUIPMENT_FAILURE"
        elif any(w in text_lower for w in ["weather", "rain", "storm", "barish", "flood"]):
            entities.delay_root_cause = "WEATHER"
        elif any(w in text_lower for w in ["design", "drawing", "rfi", "engineering"]):
            entities.delay_root_cause = "DESIGN_CHANGE"
        elif any(w in text_lower for w in ["permit", "access", "clearance", "safety"]):
            entities.delay_root_cause = "ACCESS_RESTRICTION"

        return ExtractionResult(entities=entities, confidence=confidence)

class LLMExtractionProvider(ExtractionProvider):
    def extract(self, text: str, project_id: str = None) -> ExtractionResult:
        import os
        import json
        import urllib.request
        import urllib.error
        from app.schemas.extraction import ExtractedEntities, ExtractionResult

        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            print("No OPENROUTER_API_KEY, falling back to mock")
            return MockExtractionProvider().extract(text, project_id)

        prompt = f"""You are an expert EPC AI Assistant. Extract the construction progress details from the following report.
Report: "{text}"

Respond ONLY with a valid JSON object matching this schema exactly, do not add markdown formatting or backticks:
{{
    "asset_id": "string or null (e.g., P-204, CDU-01, null)",
    "plant_unit": "string or null",
    "area": "string or null",
    "discipline": "string or null (e.g., Mechanical, Civil, Piping, Electrical)",
    "action": "string or null (e.g., MECHANICAL_INSTALLATION, CONCRETE_POURING, WELDING)",
    "progress_percent": 0.0,
    "status": "string (NOT_STARTED, IN_PROGRESS, COMPLETED)",
    "delay_days": null,
    "delay_root_cause": "string or null (MATERIAL_DELIVERY, LABOUR_SHORTAGE, EQUIPMENT_FAILURE, WEATHER, DESIGN_CHANGE, ACCESS_RESTRICTION)"
}}"""

        try:
            url = "https://openrouter.ai/api/v1/chat/completions"
            data = json.dumps({
                "model": "google/gemma-4-26b-a4b-it:free",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.0
            }).encode("utf-8")
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req) as response:
                resp_body = response.read()
                data_json = json.loads(resp_body)
                content = data_json["choices"][0]["message"]["content"]
                
                content = content.replace('```json', '').replace('```', '').strip()
                parsed = json.loads(content)
                
                entities = ExtractedEntities(
                    project_id=project_id,
                    asset_id=parsed.get("asset_id"),
                    plant_unit=parsed.get("plant_unit"),
                    area=parsed.get("area"),
                    discipline=parsed.get("discipline"),
                    action=parsed.get("action"),
                    progress_percent=parsed.get("progress_percent", 0.0),
                    status=parsed.get("status", "IN_PROGRESS"),
                    delay_days=parsed.get("delay_days"),
                    delay_root_cause=parsed.get("delay_root_cause")
                )
                return ExtractionResult(entities=entities, confidence=0.90)
        except Exception as e:
            print(f"LLM Extraction failed: {e}")
            return MockExtractionProvider().extract(text, project_id)
