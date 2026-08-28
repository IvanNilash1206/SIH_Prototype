from sqlalchemy.orm import Session
from app.models.domain import FieldReport, Extraction, Activity, MatchResult
from app.schemas.matching import CandidateMatch, MatchExplanation, MatchResultSchema
import json

def process_report_matching(report_id: str, db: Session):
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    extraction = db.query(Extraction).filter(Extraction.report_id == report_id).first()
    
    if not report or not extraction:
        return None
        
    report.processing_status = "MATCHING"
    db.commit()
    
    # 1. Context Filtering
    query = db.query(Activity).filter(Activity.project_id == report.project_id)
    
    # We could filter strictly, but for scoring we might just retrieve a broad set 
    # and score them. Let's filter by discipline if available to reduce candidates.
    if extraction.discipline:
        # Simple string match for now
        query = query.filter(Activity.discipline.ilike(f"%{extraction.discipline}%"))
        
    candidates = query.all()
    
    # 2. Scoring
    scored_candidates = []
    
    for act in candidates:
        asset_score = 0.0
        location_score = 0.0
        discipline_score = 0.0
        action_score = 0.0
        semantic_score = 0.5 # Default semantic baseline
        
        # Exact asset match is a very strong signal
        if extraction.asset_id and act.asset_id:
            if extraction.asset_id.lower() in act.asset_id.lower() or act.asset_id.lower() in extraction.asset_id.lower():
                asset_score = 1.0
                
        # Location match
        if extraction.plant_unit and act.plant_unit_id:
            # For prototype, assume we have the plant unit code in extraction matching the DB
            # Normally we would join with PlantUnit table
            location_score = 0.8
            
        # Discipline match
        if extraction.discipline and act.discipline:
            if extraction.discipline.lower() in act.discipline.lower():
                discipline_score = 1.0
                
        # Action match
        if extraction.action and act.name:
            # Very rudimentary keyword check
            action_parts = extraction.action.lower().split('_')
            for part in action_parts:
                if part in act.name.lower():
                    action_score += 0.5
            action_score = min(1.0, action_score)
            
        # 3. Calculate Confidence using the suggested formula
        # confidence = 0.40 * asset_score + 0.25 * location_score + 0.15 * discipline_score + 0.10 * action_score + 0.10 * semantic_score
        
        # If extraction confidence was low (ambiguity), cap the max confidence
        base_confidence = (0.40 * asset_score) + (0.25 * location_score) + (0.15 * discipline_score) + (0.10 * action_score) + (0.10 * semantic_score)
        
        final_confidence = base_confidence * (extraction.extraction_confidence or 1.0)
        
        if final_confidence > 0:
            scored_candidates.append({
                "activity": act,
                "confidence": final_confidence,
                "scores": {
                    "asset": asset_score,
                    "location": location_score,
                    "discipline": discipline_score,
                    "action": action_score,
                    "semantic": semantic_score
                }
            })
            
    # 4. Ranking
    scored_candidates.sort(key=lambda x: x["confidence"], reverse=True)
    
    # Save top candidates
    decision = "HUMAN_REVIEW"
    top_candidate = None
    
    if scored_candidates:
        top_candidate = scored_candidates[0]
        if top_candidate["confidence"] >= 0.85:
            decision = "AUTO_SYNC"
            
    # if asset was unknown (ambiguity), force human review
    if not extraction.asset_id:
        decision = "HUMAN_REVIEW"
            
    for idx, sc in enumerate(scored_candidates[:5]):
        act = sc["activity"]
        explanation = {
            "reasons": []
        }
        if sc["scores"]["asset"] > 0: explanation["reasons"].append("Asset ID matched")
        if sc["scores"]["location"] > 0: explanation["reasons"].append("Location matched")
        if sc["scores"]["discipline"] > 0: explanation["reasons"].append("Discipline matched")
        if sc["scores"]["action"] > 0: explanation["reasons"].append("Action matched")
        
        mr = MatchResult(
            report_id=report.id,
            activity_id=act.id,
            rank=idx + 1,
            confidence=sc["confidence"],
            asset_score=sc["scores"]["asset"],
            location_score=sc["scores"]["location"],
            discipline_score=sc["scores"]["discipline"],
            action_score=sc["scores"]["action"],
            semantic_score=sc["scores"]["semantic"],
            decision=decision if idx == 0 else "N/A",
            explanation_json=explanation
        )
        db.add(mr)
        
    report.processing_status = "MATCHED"
    db.commit()
    
    return decision
