import os
from fastapi import APIRouter, Depends, Request, Response, BackgroundTasks
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.domain import FieldReport, Activity, Project, MatchResult, Extraction
from app.schemas.report import ReportResponse
from app.services.extraction_service import process_report_extraction
from app.services.matching_service import process_report_matching
from app.services.decision_service import process_decision_and_sync
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

router = APIRouter()

class WhatsAppMessageRequest(BaseModel):
    phone_number: str = "+91 98765 43210"
    sender_name: str = "Rajesh Kumar (Site Lead)"
    message_type: str = "text" # text, audio, image, document
    message_body: str
    media_url: Optional[str] = None
    project_code: Optional[str] = "CDU-EXP-02"

class WhatsAppBotReply(BaseModel):
    status: str
    reply_text: str
    report_id: str
    processing_status: str
    extracted_entities: dict
    match_decision: str
    confidence: float
    target_activity: Optional[str]

# In-memory history for live WhatsApp simulator
whatsapp_chat_history = []

def process_whatsapp_pipeline(report_id: str, db: Session):
    try:
        extraction = process_report_extraction(report_id, db)
        if extraction:
            decision = process_report_matching(report_id, db)
            if decision:
                process_decision_and_sync(report_id, db)
    except Exception as e:
        print(f"WhatsApp pipeline error for report {report_id}: {e}")
        report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
        if report:
            report.processing_status = "FAILED"
            db.commit()

@router.get("/webhook")
def verify_webhook(hub_mode: Optional[str] = None, hub_challenge: Optional[str] = None, hub_verify_token: Optional[str] = None):
    # Meta / WhatsApp Business API verification handshake
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "synchrolink_token")
    if hub_verify_token == verify_token:
        return Response(content=hub_challenge or "OK", media_type="text/plain")
    return Response(content="Verified", media_type="text/plain")

@router.post("/webhook", response_model=WhatsAppBotReply)
def receive_whatsapp_message(req: WhatsAppMessageRequest, db: Session = Depends(get_db)):
    # 1. Resolve Project
    project = db.query(Project).first()
    project_id = project.id if project else "default-project"
    
    # 2. Ingest Field Report from WhatsApp
    source_type = "VOICE" if req.message_type == "audio" else "WHATSAPP"
    db_report = FieldReport(
        project_id=project_id,
        submitted_by=f"{req.sender_name} ({req.phone_number})",
        source_type=source_type,
        raw_text=req.message_body,
        file_reference=req.media_url,
        processing_status="RECEIVED"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # 3. Synchronously run the AI pipeline so the bot reply contains immediate resolution details
    extraction = process_report_extraction(db_report.id, db)
    decision = process_report_matching(db_report.id, db)
    if decision:
        process_decision_and_sync(db_report.id, db)

    db.refresh(db_report)

    # 4. Fetch results
    top_match = db.query(MatchResult).filter(MatchResult.report_id == db_report.id).order_by(MatchResult.rank.asc()).first()
    activity_name = "N/A"
    activity_code = "N/A"
    if top_match:
        act = db.query(Activity).filter(Activity.id == top_match.activity_id).first()
        if act:
            activity_code = act.activity_code
            activity_name = act.name

    conf_pct = round((top_match.confidence * 100), 1) if top_match else 0.0
    extracted_json = extraction.raw_json if extraction else {}

    # 5. Format WhatsApp Bot Reply
    if db_report.processing_status == "AUTO_SYNCED":
        reply = (
            f"✅ *SynchroLink AI: Progress Synced*\n\n"
            f"📋 *Activity:* {activity_code} — {activity_name}\n"
            f"📊 *Updated Progress:* {extracted_json.get('progress_percent', 0)}%\n"
            f"🎯 *Match Confidence:* {conf_pct}%\n"
            + (f"⚠️ *Delay Logged:* {extracted_json.get('delay_days')} days ({extracted_json.get('delay_root_cause')})\n" if extracted_json.get('delay_days') else "")
            + f"🔒 *Audit ID:* SYNC-{db_report.id[:8].upper()}\n\n"
            f"_Schedule updated in Primavera P6 database._"
        )
    elif db_report.processing_status == "AWAITING_REVIEW":
        reply = (
            f"⏳ *SynchroLink AI: Sent to Planner Triage*\n\n"
            f"⚠️ Match confidence is {conf_pct}% (below 85% threshold) or asset ambiguity detected.\n"
            f"🔍 *Suggested:* {activity_code} ({activity_name})\n"
            f"🎫 *Triage Ticket ID:* TRG-{db_report.id[:8].upper()}\n\n"
            f"_A senior EPC planner is reviewing this report in the Command Center._"
        )
    else:
        reply = f"ℹ️ *SynchroLink:* Report received (ID: {db_report.id[:8]}). Processing in background."

    # Save to simulator history
    chat_entry = {
        "id": db_report.id,
        "timestamp": datetime.utcnow().isoformat(),
        "sender": req.sender_name,
        "phone": req.phone_number,
        "message": req.message_body,
        "type": req.message_type,
        "bot_reply": reply,
        "status": db_report.processing_status,
        "confidence": conf_pct,
        "activity": activity_code
    }
    whatsapp_chat_history.append(chat_entry)

    return WhatsAppBotReply(
        status="success",
        reply_text=reply,
        report_id=db_report.id,
        processing_status=db_report.processing_status,
        extracted_entities=extracted_json,
        match_decision=top_match.decision if top_match else "UNKNOWN",
        confidence=top_match.confidence if top_match else 0.0,
        target_activity=f"{activity_code} - {activity_name}"
    )

@router.get("/history")
def get_whatsapp_history():
    return whatsapp_chat_history
