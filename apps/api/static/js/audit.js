(async function initAudit() {
    console.log("Audit JS Loaded");

    const tbody = document.getElementById('audit-table-body');

    try {
        const logs = await window.api.audit.getLog();
        
        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 40px;">No audit records found.</td></tr>`;
            return;
        }

        const html = logs.map(log => {
            let actionClass = 'sync';
            if (log.action_type === 'TRIAGE_RESOLVE') actionClass = 'triage';
            if (log.action_type === 'MANUAL_OVERRIDE') actionClass = 'manual';

            // Check if there is old_state / new_state info for diff rendering
            let oldVal = '--';
            let newVal = '--';
            
            if (log.details && log.details.progress_percent !== undefined) {
                newVal = `${log.details.progress_percent}%`;
            } else if (log.progress !== undefined) {
                newVal = `${log.progress}%`;
            }

            return `
            <tr>
                <td style="white-space: nowrap; color: var(--text-muted);">${new Date(log.timestamp).toLocaleString()}</td>
                <td><span class="audit-action ${actionClass}">${log.action_type || 'AUTO_SYNC'}</span></td>
                <td style="font-family: monospace; font-weight: 500;">${log.activity_id}</td>
                <td><span class="state-old">${oldVal}</span></td>
                <td><span class="state-new">${newVal}</span></td>
                <td style="color: var(--text-muted);">${log.user_id || 'System (AI)'}</td>
                <td><span class="audit-hash">${log.audit_id || log.id || 'SYS-' + Math.random().toString(36).substr(2, 6).toUpperCase()}</span></td>
            </tr>
            `;
        }).join('');

        tbody.innerHTML = html;

    } catch (e) {
        console.error("Audit Error", e);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger" style="padding: 40px;">Failed to load audit trail.</td></tr>`;
    }

})();
