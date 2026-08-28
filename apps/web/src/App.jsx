import { useState } from "react"
import WhatsAppSimulator from "./components/WhatsAppSimulator"
import VoiceIngestion from "./components/VoiceIngestion"
import { Activity, GitMerge, FileText, Brain, LayoutDashboard } from "lucide-react"

export default function App() {
  const [activeTab, setActiveTab] = useState("ingestion")

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold">
            S
          </div>
          <span className="font-semibold text-lg">SynchroLink</span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 p-3 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <LayoutDashboard size={20} />
            Command Center
          </button>
          <button 
            onClick={() => setActiveTab("ingestion")}
            className={`flex items-center gap-3 p-3 rounded-md transition-colors ${activeTab === 'ingestion' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <FileText size={20} />
            Field Ingestion
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
          <h1 className="text-xl font-semibold capitalize">{activeTab.replace("-", " ")}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Telemetry
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === "ingestion" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Brain className="text-blue-500" /> WhatsApp Integration
                  </h2>
                  <WhatsAppSimulator />
                </div>
                <div>
                  <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Activity className="text-amber-500" /> Voice & Web Ingestion
                  </h2>
                  <VoiceIngestion />
                </div>
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <GitMerge size={48} className="mx-auto mb-4 opacity-50" />
                <p>Use the previous static UI (port 8000) for the full Command Center.</p>
                <p className="text-sm">This React demo focuses on the interactive WhatsApp and Speech-to-Text ingestion pipeline.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
