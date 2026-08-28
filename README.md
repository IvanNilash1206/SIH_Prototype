# SynchroLink Prototype

Intelligent Data Capture & Schedule-Linking Layer for Infrastructure Project Management.
SIH26122 - Real-Time Actual Progress Tracking.

## Prerequisites
- Python 3.10+
- Node.js 18+
- SQLite (built-in)

## Installation & Setup

1. **Clone the repository** (or use existing directory).
2. **Backend Setup**:
   ```powershell
   cd apps\api
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. **Frontend Setup**:
   ```powershell
   cd apps\web
   npm install
   ```

## Database Seed
The database uses SQLite and initializes itself on first run with seeded data. If you need to reset the demo:
```powershell
cd apps\api
del synchrolink.db
```
It will re-create itself automatically upon the next API request.

## Running the Prototype

**Start the Backend (Command Center & API):**
```powershell
cd apps\api
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
This serves the primary Command Center UI at `http://127.0.0.1:8000`.

**Start the Frontend (React Voice/WhatsApp Simulator):**
```powershell
cd apps\web
npm run dev
```
This serves the mobile-oriented Voice & WhatsApp simulators at `http://localhost:5173`.

## AI Configuration (Demo Mode vs Real Provider)
The prototype comes with a `MockExtractionProvider` that deterministic parses text according to the SIH prompt's exact testing requirements (e.g. "CDU Unit 2 mein P-204 pump mechanical installation 80 percent complete hai").
To use a real LLM for broader testing:
Set the environment variable:
`$env:OPENROUTER_API_KEY="your-key-here"`

## Troubleshooting
- **Frontend crashes on load**: Ensure you ran `npm install` inside `apps/web`. The missing `lib/utils.js` has been patched.
- **P6 Export returns 404**: This was fixed; ensure you've restarted `uvicorn` if you recently updated the code.
- **Port in use**: If 8000 is used, run `uvicorn` with `--port 8001`.
