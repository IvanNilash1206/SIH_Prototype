from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.domain import Project
from typing import List

router = APIRouter()

@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [{"id": p.id, "name": p.name, "code": p.code} for p in projects]
