import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api import reports, projects, triage, audit, activities, delays, matches

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

