(async function initDelays() {
    console.log("Delays JS Loaded");

    const history = document.getElementById('delay-chat-history');
    const input = document.getElementById('delay-query-input');
    const btn = document.getElementById('delay-query-btn');
    const logList = document.getElementById('delay-log-list');

    // Load Delay Logs Sidebar
    try {
        const delays = await window.api.delays.getList();
        
        if (!delays || delays.length === 0) {
            logList.innerHTML = `<p class="text-muted">No delays recorded.</p>`;
        } else {
            logList.innerHTML = delays.slice(0,10).map(d => `
                <div class="delay-list-item">
                    <strong>${d.activity_id}</strong><br>
                    <span style="color:var(--warning)">${d.delay_days} days</span> — ${d.root_cause}
                    <div class="text-muted" style="margin-top:4px; font-size:0.75rem;">${d.notes || 'No notes provided'}</div>
                </div>
            `).join('');
        }
    } catch (e) {
        logList.innerHTML = `<p class="text-danger">Failed to load delay logs.</p>`;
    }

    // Chat Logic
    function appendChat(text, isUser=false) {
        const div = document.createElement('div');
        div.className = `chat-msg ${isUser ? 'user-msg' : 'ai-msg'}`;
        // Basic markdown formatting
        div.innerHTML = text.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        history.appendChild(div);
        history.scrollTop = history.scrollHeight;
    }

    async function handleQuery() {
        const text = input.value.trim();
        if (!text) return;

        appendChat(text, true);
        input.value = '';

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg ai-msg text-muted';
        typingDiv.id = typingId;
        typingDiv.innerHTML = '<em>Agent is analyzing project schedule and delay events...</em>';
        history.appendChild(typingDiv);
        history.scrollTop = history.scrollHeight;

        try {
            const res = await window.api.delays.query(text);
            document.getElementById(typingId).remove();
            
            let responseText = res.answer || res.response || "I have analyzed the delays, but could not generate a textual response.";
            appendChat(responseText, false);

        } catch (e) {
            document.getElementById(typingId).remove();
            console.error("Delay Query Error:", e);
            appendChat(`⚠️ Failed to connect to Delay Intelligence Engine.`, false);
        }
    }

    btn.addEventListener('click', handleQuery);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuery();
    });

})();
