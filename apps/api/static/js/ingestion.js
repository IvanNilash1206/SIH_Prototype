(function initIngestion() {
    console.log("Ingestion JS Loaded");

    // WhatsApp Simulator Logic
    const sendBtn = document.getElementById('wa-send-btn');
    const input = document.getElementById('wa-input');
    const chatBox = document.getElementById('wa-chat-box');

    function appendMessage(text, type) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = `wa-msg ${type}`;
        
        let formattedText = text.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        div.innerHTML = `${formattedText} <div class="wa-time">${time}</div>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage(text) {
        if (!text.trim()) return;
        
        appendMessage(text, 'sent');
        input.value = '';

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'wa-msg received text-muted';
        typingDiv.id = typingId;
        typingDiv.innerHTML = '<em>typing...</em>';
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const reqData = {
                phone_number: "+91 99999 00000",
                sender_name: "Web Simulator User",
                message_type: "text",
                message_body: text
            };
            
            const response = await window.api.whatsapp.simulate(reqData);
            document.getElementById(typingId).remove();
            
            if (response.bot_reply) {
                appendMessage(response.bot_reply, 'received');
            } else {
                appendMessage(`✅ Action logged successfully.`, 'received');
            }
        } catch (e) {
            document.getElementById(typingId).remove();
            console.error("WA Sim Error:", e);
            appendMessage(`⚠️ Error communicating with server. Is it running?`, 'received');
        }
    }

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(input.value);
    });

    // Voice Recorder Logic
    const micBtn = document.getElementById('mic-btn');
    const waveform = document.getElementById('waveform');
    const transcriptText = document.getElementById('transcript-text');
    const micStatusText = document.getElementById('mic-status-text');
    const voiceSubmitBtn = document.getElementById('voice-submit-btn');

    let isRecording = false;
    let recognition = null;
    let finalTranscript = "";

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            let currentTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            finalTranscript = currentTranscript;
            transcriptText.textContent = finalTranscript;
            transcriptText.classList.remove('italic', 'text-muted');
            voiceSubmitBtn.disabled = false;
        };
    } else {
        micStatusText.textContent = "Speech Recognition API not supported in this browser.";
    }

    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        
        isRecording = !isRecording;
        if (isRecording) {
            micBtn.classList.add('recording');
            micBtn.innerHTML = '<i class="ph-fill ph-stop"></i>';
            waveform.classList.remove('hidden');
            micStatusText.textContent = "Listening... (Speak now)";
            finalTranscript = "";
            transcriptText.textContent = "";
            voiceSubmitBtn.disabled = true;
            recognition.start();
        } else {
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '<i class="ph-fill ph-microphone"></i>';
            waveform.classList.add('hidden');
            micStatusText.textContent = "Click the microphone to start voice recording";
            recognition.stop();
        }
    });

    voiceSubmitBtn.addEventListener('click', async () => {
        if (!finalTranscript) return;
        voiceSubmitBtn.disabled = true;
        voiceSubmitBtn.innerHTML = '<i class="ph-fill ph-spinner animate-spin"></i> Processing...';
        
        try {
            const reqData = {
                phone_number: "+91 98765 43210",
                sender_name: "Rajesh Kumar (Voice UI)",
                message_type: "audio",
                message_body: finalTranscript
            };
            await window.api.whatsapp.simulate(reqData);
            
            finalTranscript = "";
            transcriptText.textContent = "Transcription will appear here...";
            transcriptText.classList.add('italic', 'text-muted');
            alert("Voice Note processed successfully!");
        } catch (e) {
            console.error("Voice submit error:", e);
            alert("Failed to send voice report.");
        } finally {
            voiceSubmitBtn.innerHTML = 'Submit Audio Report';
            voiceSubmitBtn.disabled = false;
        }
    });

})();
