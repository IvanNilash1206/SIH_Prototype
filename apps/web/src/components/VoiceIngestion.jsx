import { useState, useEffect, useRef } from "react"
import { Mic, Square, Loader2 } from "lucide-react"

export default function VoiceIngestion() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [sending, setSending] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      
      recognition.onresult = (event) => {
        let currentTranscript = ""
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setTranscript(currentTranscript)
      }

      recognitionRef.current = recognition
    } else {
      console.warn("Speech Recognition API not supported in this browser.")
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      setTranscript("")
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  const sendAudioReport = async () => {
    if (!transcript) return
    setSending(true)
    try {
      await fetch("http://localhost:8000/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: "+91 98765 43210",
          sender_name: "Rajesh Kumar (Voice UI)",
          message_type: "audio",
          message_body: transcript
        })
      })
      setTranscript("")
    } catch (e) {
      console.error("Failed to send voice report", e)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-card text-card-foreground border rounded-lg p-6 flex flex-col items-center gap-4">
      <div className="text-lg font-semibold">Field Audio Ingestion</div>
      
      <button 
        onClick={toggleRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
          isRecording 
            ? "bg-red-100 text-red-600 animate-pulse border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
        }`}
      >
        {isRecording ? <Square size={32} className="fill-current" /> : <Mic size={40} />}
      </button>

      <div className="text-sm text-muted-foreground text-center">
        {isRecording ? "Listening... (Speak now)" : "Click the microphone to start voice recording"}
      </div>

      <div className="w-full bg-muted/50 rounded-md min-h-[100px] p-3 border text-sm text-foreground overflow-y-auto max-h-[150px]">
        {transcript || <span className="text-muted-foreground italic">Transcription will appear here...</span>}
      </div>

      <button
        onClick={sendAudioReport}
        disabled={!transcript || isRecording || sending}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {sending ? <Loader2 className="animate-spin" size={16} /> : null}
        {sending ? "Processing via AI..." : "Submit Audio Report"}
      </button>
    </div>
  )
}
