(async function initTriage() {
    console.log("Triage JS Loaded");

    const container = document.getElementById('triage-list-container');
    const totalCountEl = document.getElementById('triage-total-count');

    try {
        const queue = await window.api.triage.getQueue();
        renderQueue(queue);
    } catch (e) {
        console.error("Triage Error", e);
        container.innerHTML = `<p class="text-danger">Failed to load triage queue.</p>`;
    }

    function renderQueue(queue) {
        if (!queue || queue.length === 0) {
            totalCountEl.textContent = '0';
            container.innerHTML = `
                <div class="empty-triage">
                    <i class="ph-fill ph-check-circle" style="font-size: 4rem; color: var(--accent); margin-bottom: 16px;"></i>
                    <h3>Queue is Empty</h3>
                    <p class="text-muted">All field reports have been mapped successfully.</p>
                </div>
            `;
            return;
        }

        totalCountEl.textContent = queue.length;

        const html = queue.map(item => {
            const confPercent = Math.round((item.confidence || 0) * 100);
            const suggestions = item.candidates || [];
            
            let suggestionsHtml = suggestions.map((cand, idx) => `
                <div class="suggestion-item">
                    <div class="suggestion-details">
                        <span class="suggestion-id">${cand.activity_id}</span>
                        <span class="suggestion-name">${cand.activity_name || 'Schedule Node'}</span>
                        <span class="text-muted" style="font-size:0.75rem;">Vector Match: ${Math.round(cand.confidence*100)}%</span>
                    </div>
                    <div class="triage-actions">
                        <button class="btn btn-resolve" onclick="resolveTriage('${item.triage_id}', '${cand.activity_id}', ${cand.confidence})">
                            <i class="ph ph-check"></i> Map & Sync
                        </button>
                    </div>
                </div>
            `).join('');

            if (suggestions.length === 0) {
                suggestionsHtml = `<p class="text-muted" style="font-size:0.85rem;">No close matches found. Manual mapping required.</p>`;
            }

            return `
            <div class="triage-card" id="triage-${item.triage_id}">
                <div class="triage-header">
                    <div>
                        <div style="font-size: 0.8rem; color: var(--warning); font-weight: 600; letter-spacing: 1px;">AMBIGUOUS MATCH</div>
                        <div class="text-muted" style="font-size: 0.85rem;">Source: ${item.source || 'WhatsApp'} | Received: ${new Date(item.timestamp || Date.now()).toLocaleString()}</div>
                    </div>
                    <div class="confidence-indicator">
                        <i class="ph ph-warning-circle" style="color: var(--warning)"></i>
                        <span class="text-warning">Max Conf: ${confPercent}%</span>
                    </div>
                </div>
                
                <div>
                    <div class="mb-16" style="font-size: 0.85rem; color: var(--text-muted);">Raw Extracted Input:</div>
                    <div class="raw-input">
                        " ${item.raw_text} "
                    </div>
                </div>

                <div class="mt-16">
                    <div class="mb-16" style="font-size: 0.85rem; color: var(--text-muted);">HCL Engine Suggestions:</div>
                    <div class="triage-suggestions">
                        ${suggestionsHtml}
                    </div>
                </div>
                
                <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; display: flex; justify-content: flex-end;">
                     <button class="btn btn-secondary" onclick="rejectTriage('${item.triage_id}')">
                        <i class="ph ph-x"></i> Reject Report
                    </button>
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // Expose functions globally for inline onclick handlers
    window.resolveTriage = async function(triageId, activityId, conf) {
        try {
            await window.api.triage.resolve(triageId, {
                triage_id: triageId,
                selected_activity_id: activityId,
                action: 'APPROVE',
                planner_notes: 'Resolved via Web UI'
            });
            // Provide UI feedback
            const card = document.getElementById(`triage-${triageId}`);
            card.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--accent);"><i class="ph-fill ph-check-circle" style="font-size: 2rem;"></i><p>Successfully mapped and synced to ${activityId}. RLHF rewarded.</p></div>`;
            setTimeout(() => {
                initTriage(); // Refresh
                if (window.appRouter) window.appRouter.pollTriageCount();
            }, 1500);
        } catch(e) {
            alert('Failed to resolve triage item.');
            console.error(e);
        }
    }

    window.rejectTriage = async function(triageId) {
        if(!confirm('Are you sure you want to reject and discard this report?')) return;
        try {
            await window.api.triage.resolve(triageId, {
                triage_id: triageId,
                action: 'REJECT'
            });
            initTriage(); // Refresh
            if (window.appRouter) window.appRouter.pollTriageCount();
        } catch(e) {
            alert('Failed to reject triage item.');
            console.error(e);
        }
    }
})();
