(async function initDashboard() {
    console.log("Dashboard JS Loaded");

    try {
        // Fetch stats
        const stats = await window.api.dashboard.getStats();
        
        document.getElementById('dash-progress').textContent = `${(stats.overall_progress * 100).toFixed(1)}%`;
        document.getElementById('dash-completed').textContent = stats.completed_count;
        document.getElementById('dash-in-progress').textContent = stats.in_progress_count;
        document.getElementById('dash-delayed').textContent = stats.delayed_count;

        // Fetch Timeline/Activities (Mocked endpoint structure from projects router)
        // If /projects/timeline doesn't exist, we fallback to /projects/
        let activities = [];
        try {
            const projData = await window.api.get('/projects/');
            // Assuming projData has an activities list or we fetch /activities/
            activities = projData[0]?.activities || [];
        } catch(e) {
            activities = await window.api.get('/activities/');
        }

        renderScheduleList(activities);
        renderActivityStream(activities);

    } catch (e) {
        console.error("Dashboard Init Error", e);
        document.getElementById('dash-schedule-list').innerHTML = `<p class="text-danger">Failed to load schedule data.</p>`;
    }

    function renderScheduleList(activities) {
        const container = document.getElementById('dash-schedule-list');
        if (!activities || activities.length === 0) {
            container.innerHTML = `<p class="text-muted">No activities found.</p>`;
            return;
        }

        const html = activities.slice(0, 10).map(act => {
            const isDelayed = act.status === 'DELAYED';
            const statusColor = isDelayed ? 'var(--danger)' : (act.status === 'COMPLETED' ? 'var(--accent)' : 'var(--primary)');
            
            return `
            <div class="schedule-item">
                <div class="schedule-item-header">
                    <span class="schedule-id">${act.activity_id}</span>
                    <span class="schedule-status" style="color: ${statusColor}">${act.status}</span>
                </div>
                <div class="schedule-name">${act.description || act.name || 'Unknown Activity'}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.8rem; color: var(--text-muted);">
                    <span>Progress: ${act.progress_percent}%</span>
                    <span>${act.discipline || 'General'}</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${act.progress_percent}%; background: ${statusColor}; box-shadow: 0 0 10px ${statusColor}"></div>
                </div>
            </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }

    function renderActivityStream(activities) {
        const container = document.getElementById('dash-activity-stream');
        
        // Mocking some recent activity based on the data
        const recent = activities
            .filter(a => a.progress_percent > 0)
            .sort((a,b) => b.progress_percent - a.progress_percent)
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = `<p class="text-muted">No recent activity.</p>`;
            return;
        }

        const html = recent.map(act => {
            let icon = 'sync';
            let iconClass = 'ph-arrows-clockwise';
            if (act.status === 'DELAYED') { icon = 'delay'; iconClass = 'ph-warning'; }
            if (act.status === 'IN_TRIAGE') { icon = 'triage'; iconClass = 'ph-shield-warning'; }

            return `
            <div class="activity-item">
                <div class="activity-icon ${icon}">
                    <i class="ph ${iconClass}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-text">
                        <strong>${act.activity_id}</strong> updated to ${act.progress_percent}% progress.
                    </div>
                    <div class="activity-time">Just now</div>
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = html;
    }
})();
