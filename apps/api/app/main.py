import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from root and parent directories
env_paths = [
    Path(__file__).resolve().parent.parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent / ".env",
    Path(__file__).resolve().parent / ".env",
    Path.cwd() / ".env",
    Path.cwd().parent / ".env"
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api import reports, projects, triage, audit, activities, delays, matches, whatsapp, p6_export

app = FastAPI(
    title="SynchroLink API",
    description="API for SynchroLink EPC Progress Intelligence Prototype",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For prototype
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(triage.router, prefix="/api/triage", tags=["triage"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(delays.router, prefix="/api/delays", tags=["delays"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["whatsapp"])
app.include_router(p6_export.router, prefix="/api/p6", tags=["p6"])

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Mount Static Files & Frontend SPA
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(static_dir, "index.html"))

