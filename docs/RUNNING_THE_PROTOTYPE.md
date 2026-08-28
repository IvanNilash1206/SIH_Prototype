# Running the Prototype

This guide provides step-by-step instructions to completely start and run the SynchroLink prototype on a clean machine. 

## 1. Starting the Command Center (Backend API & Static UI)

The Command Center is a FastAPI application that serves the core dashboards, Gantt chart, Delay Intelligence, and Triage hub.

1. Open a PowerShell terminal.
2. Navigate to the API folder:
   ```powershell
   cd apps\api
   ```
3. Activate the virtual environment (assuming dependencies are already installed):
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
4. Start the Uvicorn server:
   ```powershell
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
5. Open your browser and navigate to: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## 2. Starting the Field Reporting Simulators (React UI)

The field reporting tools (Voice Ingestion, WhatsApp Simulator) are built in a separate React application.

1. Open a *new* PowerShell terminal.
2. Navigate to the web folder:
   ```powershell
   cd apps\web
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

## 3. Demo Reset

If you need to completely reset the application state (e.g., to clear out submitted reports, Gantt updates, and audit logs) back to the original seeded state:

1. Stop the Uvicorn server (Ctrl+C).
2. Delete the SQLite database:
   ```powershell
   cd apps\api
   del synchrolink.db
   ```
3. Restart the Uvicorn server. The database and seed data will be regenerated automatically.

## 4. Testing the Golden Workflow

1. Navigate to `http://127.0.0.1:8000`.
2. Click **Field Ingestion** on the sidebar.
3. Click the **[Test Golden]** button to populate the report, or manually paste:
   *"CDU Unit 2 mein P-204 pump mechanical installation 80 percent complete hai. Material delivery ki wajah se 2 din delay hua."*
4. Click **Ingest & Process**.
5. Wait a moment for the AI extraction and matching to finish. You should see it extract `P-204`, `80%`, and log a `2 days` delay with `High Confidence` (>=85%).
6. Navigate to **Gantt & Progress**. Find `P-204` and verify its Actual progress is now 80%.
7. Navigate to **Delay Intelligence** and view the newly logged Material Delivery delay.
8. Navigate to **Audit Trail** and observe the automated synchronization record.
