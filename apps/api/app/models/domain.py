from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PlantUnit(Base):
    __tablename__ = "plant_units"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)

class WBSNode(Base):
    __tablename__ = "wbs_nodes"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    parent_id = Column(String, ForeignKey("wbs_nodes.id"), nullable=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    level = Column(Integer, nullable=False)

class Activity(Base):
    __tablename__ = "activities"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    wbs_node_id = Column(String, ForeignKey("wbs_nodes.id"))
    activity_code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    discipline = Column(String)
    plant_unit_id = Column(String, ForeignKey("plant_units.id"))
    area = Column(String)
    asset_id = Column(String, nullable=True)
    planned_start = Column(DateTime)
    planned_finish = Column(DateTime)
    baseline_progress = Column(Float, default=0.0)
    actual_progress = Column(Float, default=0.0)
    status = Column(String, default="PLANNED")
    is_delayed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FieldReport(Base):
    __tablename__ = "field_reports"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    submitted_by = Column(String)
    source_type = Column(String) # TEXT, VOICE, FILE
    raw_text = Column(Text)
    transcript = Column(Text, nullable=True)
    file_reference = Column(String, nullable=True)
    report_date = Column(DateTime, default=datetime.utcnow)
    processing_status = Column(String, default="RECEIVED")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Extraction(Base):
    __tablename__ = "extractions"
    id = Column(String, primary_key=True, default=generate_uuid)
    report_id = Column(String, ForeignKey("field_reports.id"))
    discipline = Column(String, nullable=True)
    plant_unit = Column(String, nullable=True)
    area = Column(String, nullable=True)
    asset_id = Column(String, nullable=True)
    action = Column(String, nullable=True)
    progress_percent = Column(Float, nullable=True)
    status = Column(String, nullable=True)
    delay_days = Column(Integer, nullable=True)
    delay_root_cause = Column(String, nullable=True)
    raw_json = Column(JSON)
    extraction_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MatchResult(Base):
    __tablename__ = "match_results"
    id = Column(String, primary_key=True, default=generate_uuid)
    report_id = Column(String, ForeignKey("field_reports.id"))
    activity_id = Column(String, ForeignKey("activities.id"))
    rank = Column(Integer)
    confidence = Column(Float)
    asset_score = Column(Float)
    location_score = Column(Float)
    discipline_score = Column(Float)
    action_score = Column(Float)
    semantic_score = Column(Float)
    decision = Column(String) # AUTO_SYNC, HUMAN_REVIEW, REJECT
    explanation_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class PlannerReview(Base):
    __tablename__ = "planner_reviews"
    id = Column(String, primary_key=True, default=generate_uuid)
    report_id = Column(String, ForeignKey("field_reports.id"))
    selected_activity_id = Column(String, ForeignKey("activities.id"), nullable=True)
    decision = Column(String) # PENDING, APPROVED, REJECTED
    reviewer = Column(String, nullable=True)
    comment = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

class DelayEvent(Base):
    __tablename__ = "delay_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    activity_id = Column(String, ForeignKey("activities.id"))
    report_id = Column(String, ForeignKey("field_reports.id"))
    delay_days = Column(Integer)
    root_cause = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    report_id = Column(String, ForeignKey("field_reports.id"), nullable=True)
    activity_id = Column(String, ForeignKey("activities.id"), nullable=True)
    actor_type = Column(String) # SYSTEM, USER
    actor_id = Column(String, nullable=True)
    event_type = Column(String) # UPDATE_PROGRESS, SCHEDULE_MUTATION
    old_value_json = Column(JSON)
    new_value_json = Column(JSON)
    confidence = Column(Float, nullable=True)
    decision = Column(String, nullable=True)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
