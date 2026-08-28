from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.domain import Project
from scripts.seed import reset_db, seed_data
from typing import List

router = APIRouter()

@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [{"id": p.id, "name": p.name, "code": p.code, "description": p.description} for p in projects]

@router.post("/reset")
def reset_project_data(db: Session = Depends(get_db)):
    reset_db()
    seed_data(db)
    return {"status": "success", "message": "Database reset and seeded successfully."}
