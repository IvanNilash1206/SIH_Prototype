(function initIngestion() {
    console.log("Ingestion JS Loaded");

    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });

    // WhatsApp Simulator Logic
    const sendBtn = document.getElementById('wa-send-btn');
    const input = document.getElementById('wa-input');
    const chatBox = document.getElementById('wa-chat-box');
    const scenarioBtns = document.querySelectorAll('.scenario-btn');

    function appendMessage(text, type) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = `wa-msg ${type}`;
        
        // Convert simple markdown-like newlines or bold
        let formattedText = text.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');

        div.innerHTML = `${formattedText} <div class="wa-time">${time}</div>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage(text) {
        if (!text.trim()) return;
        
        appendMessage(text, 'sent');
        input.value = '';

        // Add typing indicator mockup
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'wa-msg received text-muted';
        typingDiv.id = typingId;
        typingDiv.innerHTML = '<em>typing...</em>';
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            // Call webhook simulator API
            const reqData = {
                phone_number: "+91 99999 00000",
                sender_name: "Web Simulator User",
                message_type: "text",
                message_body: text
            };
            
            // Depending on how backend WhatsApp router is built, it might return a response directly 
            // or we mock the response if it's async Twilio. Assuming it returns response directly for the demo.
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

    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const msg = btn.getAttribute('data-msg');
            sendMessage(msg);
        });
    });

    // Voice Recorder Mockup Logic
    const micBtn = document.getElementById('mic-btn');
    const waveform = document.getElementById('waveform');
    let isRecording = false;

    micBtn.addEventListener('click', () => {
        isRecording = !isRecording;
        if (isRecording) {
            micBtn.classList.add('recording');
            micBtn.innerHTML = '<i class="ph-fill ph-stop"></i>';
            waveform.classList.remove('hidden');
        } else {
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '<i class="ph-fill ph-microphone"></i>';
            waveform.classList.add('hidden');
            
            // Simulate processing
            alert("Voice Note processed. Ready to send to API.");
        }
    });

})();
