import { useState, useEffect, useRef } from "react"
import { Send, CheckCheck, User, Bot } from "lucide-react"
import { cn } from "../lib/utils"

export default function WhatsAppSimulator() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/whatsapp/history")
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (e) {
      console.error("Failed to fetch WhatsApp history", e)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setLoading(true)
    const text = input
    setInput("")
    
    try {
      await fetch("http://localhost:8000/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: "+91 98765 43210",
          sender_name: "Rajesh Kumar (Site Lead)",
          message_type: "text",
          message_body: text
        })
      })
      await fetchHistory()
    } catch (e) {
      console.error("Failed to send message", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-lg overflow-hidden bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover">
      <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 shadow-md z-10">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <Bot size={24} className="text-gray-600" />
        </div>
        <div>
          <div className="font-semibold text-[15px]">SynchroLink Bot</div>
          <div className="text-xs text-green-100">online</div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-500 bg-white/80 p-2 rounded-md mx-auto">
            Send a progress update to SynchroLink
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-end">
              <div className="bg-[#dcf8c6] p-2 rounded-lg max-w-[80%] rounded-tr-none shadow-sm relative text-sm text-gray-800">
                {msg.message}
                <div className="text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end gap-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  <CheckCheck size={14} className="text-blue-500" />
                </div>
              </div>
            </div>
            {msg.bot_reply && (
              <div className="flex justify-start">
                <div className="bg-white p-2 rounded-lg max-w-[85%] rounded-tl-none shadow-sm relative text-sm text-gray-800 whitespace-pre-wrap">
                  {msg.bot_reply}
                  <div className="text-[10px] text-gray-400 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-[#f0f0f0] p-3 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message" 
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none border-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-[#00897b] flex items-center justify-center text-white disabled:opacity-50"
        >
          <Send size={18} className="ml-1" />
        </button>
      </form>
    </div>
  )
}
