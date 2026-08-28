/**
 * SynchroLink EPC Intelligence — Frontend Application Controller
 */

const API_BASE = window.location.origin;

// State Store
const state = {
    projectId: null,
    currentScreen: 'command-center',
    activities: [],
    reports: [],
    matches: [],
    delays: [],
    auditEvents: [],
    triageItems: [],
    selectedReportId: null,
    isRecordingVoice: false
};

// Preset Scenarios
const PRESETS = {
    golden: {
        text: "CDU Unit 2 mein P-204 pump mechanical installation 80 percent complete hai. Material delivery ki wajah se 2 din delay hua.",
        unit: "CDU-02",
        supervisor: "Rajesh Kumar (Lead Site Engr)"
    },
    ambiguous: {
        text: "Pump area ka installation almost complete hai. Testing pending hai.",
        unit: "CDU-02",
        supervisor: "Anil Sharma (Piping Supervisor)"
    },
    civil: {
        text: "CDU-02 mein foundation F-102 ka concrete pour 95 percent complete ho gaya.",
        unit: "CDU-02",
        supervisor: "Vikas Patel (Civil Engr)"
    },
    electrical: {
        text: "Control room panel EP-07 cable termination 60 percent complete hai.",
        unit: "CONTROL-ROOM",
        supervisor: "Sunil Verma (Electrical Incharge)"
    },
    completion: {
        text: "P-203 mechanical installation complete, actual progress 100 percent.",
        unit: "CDU-02",
        supervisor: "Rajesh Kumar (Lead Site Engr)"
    }
};

// DOM Elements
const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    screenViews: document.querySelectorAll('.screen-view'),
    pageTitle: document.getElementById('page-title'),
    headerBreadcrumb: document.getElementById('header-breadcrumb'),
    formReport: document.getElementById('form-field-report'),
    rawTextInput: document.getElementById('report-raw-text'),
    supervisorInput: document.getElementById('report-supervisor'),
    plantUnitInput: document.getElementById('report-plant-unit'),
    btnResetDemo: document.getElementById('btn-reset-demo'),
    btnHeaderNewReport: document.getElementById('btn-header-new-report'),
    btnGotoTriage: document.getElementById('btn-goto-triage'),
    btnRefreshFeed: document.getElementById('btn-refresh-feed'),
    btnViewAllDelays: document.getElementById('btn-view-all-delays'),
    btnViewAllAudit: document.getElementById('btn-view-all-audit'),
    btnRecordVoice: document.getElementById('btn-record-voice'),
    ganttSearch: document.getElementById('gantt-search'),
    ganttDisciplineFilter: document.getElementById('gantt-discipline-filter'),
    selectExtractionReport: document.getElementById('select-extraction-report'),
    toastContainer: document.getElementById('toast-container')
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    setupPresets();
    setupForms();
    setupVoiceSimulator();
    setupFilters();
    
    await loadInitialData();
    
    // Polling for live telemetry
    setInterval(refreshLiveData, 3000);
});

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Navigation Handling
function setupNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.getAttribute('data-screen');
            switchScreen(screen);
        });
    });

    if (elements.btnHeaderNewReport) {
        elements.btnHeaderNewReport.addEventListener('click', () => switchScreen('field-reports'));
    }
    if (elements.btnGotoTriage) {
        elements.btnGotoTriage.addEventListener('click', () => switchScreen('planner-triage'));
    }
    if (elements.btnViewAllDelays) {
        elements.btnViewAllDelays.addEventListener('click', () => switchScreen('delay-intelligence'));
    }
    if (elements.btnViewAllAudit) {
        elements.btnViewAllAudit.addEventListener('click', () => switchScreen('audit-trail'));
    }
    if (elements.btnRefreshFeed) {
        elements.btnRefreshFeed.addEventListener('click', () => {
            refreshLiveData();
            showToast('Schedule telemetry refreshed', 'info');
        });
    }

    // Ingestion tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const activeTab = document.getElementById(`tab-${tab}`);
            if (activeTab) activeTab.classList.add('active');
        });
    });
}

function switchScreen(screenId) {
    state.currentScreen = screenId;

    elements.navItems.forEach(item => {
        if (item.getAttribute('data-screen') === screenId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    elements.screenViews.forEach(view => {
        if (view.id === `screen-${screenId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Update Header
    const screenTitles = {
        'command-center': 'Command Center',
        'field-reports': 'Field Progress Ingestion',
        'extraction-view': 'Multi-modal Extraction Intelligence',
        'matching-intelligence': 'Schedule Matching Intelligence',
        'planner-triage': 'Planner Triage Queue',
        'gantt-progress': 'Schedule & Gantt Progress',
        'delay-intelligence': 'Delay & Root Cause Intelligence',
        'audit-trail': 'SOC2 Schedule Audit Log'
    };

    elements.pageTitle.textContent = screenTitles[screenId] || 'Command Center';
    elements.headerBreadcrumb.innerHTML = `CDU-EXP-02 &rsaquo; ${screenTitles[screenId] || 'Operations'}`;

    // Trigger Screen Specific Render
    renderActiveScreen();
}

// Preset Handlers
function setupPresets() {
    Object.keys(PRESETS).forEach(key => {
        const btn = document.getElementById(`preset-${key}`);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const data = PRESETS[key];
                elements.rawTextInput.value = data.text;
                elements.plantUnitInput.value = data.unit;
                elements.supervisorInput.value = data.supervisor;
                showToast(`Loaded "${key.toUpperCase()}" scenario preset`, 'info');
            });
        }
    });

    const btnLoadAmbiguousDemo = document.getElementById('btn-load-ambiguous-demo');
    if (btnLoadAmbiguousDemo) {
        btnLoadAmbiguousDemo.addEventListener('click', () => {
            switchScreen('field-reports');
            const data = PRESETS.ambiguous;
            elements.rawTextInput.value = data.text;
            elements.plantUnitInput.value = data.unit;
            elements.supervisorInput.value = data.supervisor;
            showToast('Ambiguous scenario preset loaded. Click Ingest to submit.', 'info');
        });
    }
}

// Voice Simulator
function setupVoiceSimulator() {
    const card = document.querySelector('.voice-recorder-card');
    if (!elements.btnRecordVoice || !card) return;

    elements.btnRecordVoice.addEventListener('click', () => {
        state.isRecordingVoice = !state.isRecordingVoice;
        const statusEl = document.getElementById('record-status');

        if (state.isRecordingVoice) {
            card.classList.add('recording');
            statusEl.textContent = 'Listening to speech telemetry... (Speaking in Hinglish)';
            elements.rawTextInput.value = '';
            
            // Simulate live speech-to-text typing
            const transcript = PRESETS.golden.text;
            let i = 0;
            const interval = setInterval(() => {
                if (!state.isRecordingVoice) {
                    clearInterval(interval);
                    return;
                }
                elements.rawTextInput.value = transcript.slice(0, i += 4);
                if (i >= transcript.length) {
                    clearInterval(interval);
                    state.isRecordingVoice = false;
                    card.classList.remove('recording');
                    statusEl.textContent = 'Voice capture complete. Ready for pipeline processing.';
                    showToast('Voice transcription synchronized', 'success');
                }
            }, 80);
        } else {
            card.classList.remove('recording');
            statusEl.textContent = 'Recording stopped.';
        }
    });
}

// Form Handlers
function setupForms() {
    elements.formReport.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawText = elements.rawTextInput.value.trim();
        if (!rawText) {
            showToast('Please enter a field report transcript', 'error');
            return;
        }

        const payload = {
            project_id: state.projectId,
            submitted_by: elements.supervisorInput.value.trim() || 'Site Supervisor',
            source_type: document.querySelector('.tab-btn.active')?.getAttribute('data-tab')?.toUpperCase() || 'TEXT',
            raw_text: rawText
        };

        const submitBtn = document.getElementById('btn-submit-report');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ingesting Telemetry...';

        animatePipelineSteps();

        try {
            const res = await fetch(`${API_BASE}/api/reports/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Ingestion request failed');
            const data = await res.json();
            
            showToast(`Field report #${data.id.slice(0, 8)} ingested successfully`, 'success');
            elements.rawTextInput.value = '';
            
            // Refresh and switch to extraction after short delay
            setTimeout(async () => {
                await refreshLiveData();
                state.selectedReportId = data.id;
                switchScreen('extraction-view');
            }, 1200);

        } catch (err) {
            console.error(err);
            showToast('Failed to ingest report: ' + err.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> Ingest & Process AI Intelligence Pipeline';
        }
    });

    if (elements.btnResetDemo) {
        elements.btnResetDemo.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to reset and reseed the prototype database?')) return;
            try {
                const res = await fetch(`${API_BASE}/api/projects/reset`, { method: 'POST' });
                if (!res.ok) throw new Error('Reset failed');
                showToast('Prototype database reset & seeded with 205 activities', 'success');
                await loadInitialData();
            } catch (err) {
                console.error(err);
                showToast('Error resetting database: ' + err.message, 'error');
            }
        });
    }

    if (elements.selectExtractionReport) {
        elements.selectExtractionReport.addEventListener('change', (e) => {
            state.selectedReportId = e.target.value;
            renderExtractionView();
        });
    }
}

function animatePipelineSteps() {
    const steps = ['received', 'extracting', 'filtering', 'matching', 'decision'];
    const badge = document.getElementById('pipeline-status-badge');
    badge.textContent = 'PROCESSING';
    badge.className = 'badge badge-warning';

    steps.forEach((step, idx) => {
        setTimeout(() => {
            steps.forEach(s => {
                const item = document.getElementById(`step-${s}`);
                if (item) item.className = 'step-item';
            });
            const currentItem = document.getElementById(`step-${step}`);
            if (currentItem) currentItem.className = 'step-item active';

            if (idx === steps.length - 1) {
                setTimeout(() => {
                    steps.forEach(s => {
                        const item = document.getElementById(`step-${s}`);
                        if (item) item.className = 'step-item done';
                    });
                    badge.textContent = 'COMPLETED';
                    badge.className = 'badge badge-success';
                }, 400);
            }
        }, idx * 250);
    });
}

// Gantt Filter setup
function setupFilters() {
    if (elements.ganttSearch) {
        elements.ganttSearch.addEventListener('input', renderGantt);
    }
    if (elements.ganttDisciplineFilter) {
        elements.ganttDisciplineFilter.addEventListener('change', renderGantt);
    }
}

// Initial Data Load
async function loadInitialData() {
    try {
        const projRes = await fetch(`${API_BASE}/api/projects/`);
        const projects = await projRes.json();
        if (projects.length > 0) {
            state.projectId = projects[0].id;
            document.getElementById('sidebar-project-name').textContent = projects[0].name;
            document.getElementById('sidebar-project-code').textContent = projects[0].code;
        }
        await refreshLiveData();
    } catch (err) {
        console.error('Initial data load error:', err);
    }
}

// Live Data Refresh
async function refreshLiveData() {
    try {
        const [actRes, repRes, matRes, delRes, audRes, triRes] = await Promise.all([
            fetch(`${API_BASE}/api/activities/`),
            fetch(`${API_BASE}/api/reports/`),
            fetch(`${API_BASE}/api/matches/`),
            fetch(`${API_BASE}/api/delays/`),
            fetch(`${API_BASE}/api/audit/`),
            fetch(`${API_BASE}/api/triage/`)
        ]);

        state.activities = await actRes.json();
        state.reports = await repRes.json();
        state.matches = await matRes.json();
        state.delays = await delRes.json();
        state.auditEvents = await audRes.json();
        state.triageItems = await triRes.json();

        updateCounters();
        renderActiveScreen();
    } catch (err) {
        console.error('Telemetry refresh error:', err);
    }
}

// Counters & KPI updates
function updateCounters() {
    const totalActs = state.activities.length;
    const autoSynced = state.auditEvents.filter(a => a.decision === 'AUTO_SYNC').length;
    const awaitingTriage = state.triageItems.length;
    const delayedActs = state.activities.filter(a => a.is_delayed || (a.baseline_progress > a.actual_progress + 5)).length;

    // Schedule Health calculation
    let health = 100 - (delayedActs * 2.5);
    if (health < 0) health = 0;

    document.getElementById('kpi-total-activities').textContent = totalActs;
    document.getElementById('kpi-auto-synced').textContent = autoSynced;
    document.getElementById('kpi-awaiting-review').textContent = awaitingTriage;
    document.getElementById('kpi-delayed-activities').textContent = delayedActs;
    document.getElementById('kpi-schedule-health').textContent = `${health.toFixed(1)}%`;
    document.getElementById('kpi-total-reports').textContent = state.reports.length;

    // Sidebar Triage Count
    const triageCountBadge = document.getElementById('nav-triage-count');
    const triageAlertBanner = document.getElementById('command-triage-alert');
    const alertTriageCount = document.getElementById('alert-triage-count');
    const triagePendingBadge = document.getElementById('triage-pending-badge');

    if (awaitingTriage > 0) {
        triageCountBadge.textContent = awaitingTriage;
        triageCountBadge.classList.remove('hidden');
        if (triageAlertBanner) triageAlertBanner.classList.remove('hidden');
        if (alertTriageCount) alertTriageCount.textContent = awaitingTriage;
        if (triagePendingBadge) triagePendingBadge.textContent = `${awaitingTriage} Pending Review`;
    } else {
        triageCountBadge.classList.add('hidden');
        if (triageAlertBanner) triageAlertBanner.classList.add('hidden');
        if (triagePendingBadge) triagePendingBadge.textContent = `0 Pending Review`;
    }

    // Delay counter
    const delayCountBadge = document.getElementById('nav-delay-count');
    if (state.delays.length > 0) {
        delayCountBadge.textContent = state.delays.length;
        delayCountBadge.classList.remove('hidden');
    } else {
        delayCountBadge.classList.add('hidden');
    }
}

// Active Screen Renderer Dispatcher
function renderActiveScreen() {
    switch (state.currentScreen) {
        case 'command-center':
            renderCommandCenter();
            break;
        case 'field-reports':
            renderRecentReports();
            break;
        case 'extraction-view':
            renderExtractionView();
            break;
        case 'matching-intelligence':
            renderMatchingIntelligence();
            break;
        case 'planner-triage':
            renderPlannerTriage();
            break;
        case 'gantt-progress':
            renderGantt();
            break;
        case 'delay-intelligence':
            renderDelayIntelligence();
            break;
        case 'audit-trail':
            renderAuditTrail();
            break;
    }
}

// Screen 1: Command Center
function renderCommandCenter() {
    // 1. Discipline Progress Breakdown
    const disciplines = ['Mechanical', 'Civil', 'Piping', 'Electrical', 'Instrumentation'];
    const discList = document.getElementById('discipline-progress-list');
    
    if (discList && state.activities.length > 0) {
        let discHtml = '';
        disciplines.forEach(disc => {
            const discActs = state.activities.filter(a => a.discipline === disc);
            if (discActs.length === 0) return;

            const totalActual = discActs.reduce((acc, a) => acc + (a.actual_progress || 0), 0);
            const totalBaseline = discActs.reduce((acc, a) => acc + (a.baseline_progress || 0), 0);
            const avgActual = (totalActual / discActs.length).toFixed(1);
            const avgBaseline = (totalBaseline / discActs.length).toFixed(1);

            discHtml += `
                <div class="discipline-item">
                    <div class="discipline-header">
                        <span class="discipline-name">${disc}</span>
                        <span class="discipline-pct">${avgActual}% <span class="text-muted text-sm">(Base: ${avgBaseline}%)</span></span>
                    </div>
                    <div class="progress-track-dual">
                        <div class="progress-fill-actual" style="width: ${avgActual}%;"></div>
                    </div>
                </div>
            `;
        });
        discList.innerHTML = discHtml;
    }

    // 2. Activity Feed
    const feedList = document.getElementById('dashboard-activity-feed');
    if (feedList) {
        const sortedActs = [...state.activities].sort((a, b) => (b.actual_progress || 0) - (a.actual_progress || 0)).slice(0, 6);
        let feedHtml = '';
        sortedActs.forEach(act => {
            const badgeClass = act.status === 'COMPLETED' ? 'badge-success' : (act.status === 'IN_PROGRESS' ? 'badge-primary' : 'badge-subtle');
            feedHtml += `
                <div class="feed-item">
                    <div class="feed-info">
                        <div class="feed-code">${act.activity_code}</div>
                        <div class="feed-name">${act.name}</div>
                    </div>
                    <div class="feed-progress">
                        <span class="feed-progress-val">${act.actual_progress}%</span>
                        <div><span class="badge ${badgeClass} text-sm">${act.status}</span></div>
                    </div>
                </div>
            `;
        });
        feedList.innerHTML = feedHtml || '<div class="p-3 text-muted text-center">No activities found.</div>';
    }

    // 3. Recent Delays
    const delayTbody = document.querySelector('#table-dashboard-delays tbody');
    if (delayTbody) {
        if (state.delays.length === 0) {
            delayTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No active delays detected.</td></tr>';
        } else {
            let html = '';
            state.delays.slice(0, 4).forEach(del => {
                html += `
                    <tr>
                        <td><strong>${del.activity_code}</strong><br><span class="text-muted text-sm">${del.activity_name}</span></td>
                        <td><span class="badge badge-danger">+${del.delay_days} Days</span></td>
                        <td><span class="badge badge-warning">${del.root_cause}</span></td>
                        <td class="text-muted text-sm">${new Date(del.created_at).toLocaleTimeString()}</td>
                    </tr>
                `;
            });
            delayTbody.innerHTML = html;
        }
    }

    // 4. Recent Audit Mutations
    const auditTbody = document.querySelector('#table-dashboard-audit tbody');
    if (auditTbody) {
        if (state.auditEvents.length === 0) {
            auditTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No schedule mutations recorded yet.</td></tr>';
        } else {
            let html = '';
            state.auditEvents.slice(0, 4).forEach(aud => {
                const oldVal = aud.old_value_json?.actual_progress ?? 0;
                const newVal = aud.new_value_json?.actual_progress ?? 0;
                const actorBadge = aud.actor_type === 'SYSTEM' ? 'badge-primary' : 'badge-warning';

                html += `
                    <tr>
                        <td class="text-muted text-sm">${new Date(aud.created_at).toLocaleTimeString()}</td>
                        <td><span class="badge ${actorBadge}">${aud.actor_type}</span></td>
                        <td><strong>${aud.activity_code || 'General'}</strong></td>
                        <td><span class="text-muted">${oldVal}%</span> &rarr; <strong class="text-emerald">${newVal}%</strong></td>
                    </tr>
                `;
            });
            auditTbody.innerHTML = html;
        }
    }
}

// Screen 2: Field Ingestion Queue
function renderRecentReports() {
    const tbody = document.querySelector('#table-recent-reports tbody');
    if (!tbody) return;

    if (state.reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No reports ingested yet. Submit above.</td></tr>';
        return;
    }

    let html = '';
    state.reports.slice(0, 8).forEach(rep => {
        let statusBadge = 'badge-subtle';
        if (rep.processing_status === 'AUTO_SYNCED') statusBadge = 'badge-success';
        else if (rep.processing_status === 'AWAITING_REVIEW') statusBadge = 'badge-warning';
        else if (rep.processing_status === 'SYNCED') statusBadge = 'badge-info';
        else if (rep.processing_status === 'FAILED') statusBadge = 'badge-danger';

        const snippet = rep.raw_text.length > 55 ? rep.raw_text.substring(0, 55) + '...' : rep.raw_text;

        html += `
            <tr>
                <td class="text-muted text-sm">${new Date(rep.created_at).toLocaleTimeString()}</td>
                <td title="${rep.raw_text}">${snippet}</td>
                <td><span class="badge ${statusBadge}">${rep.processing_status}</span></td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="inspectReport('${rep.id}')">
                        Inspect &rarr;
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

window.inspectReport = function(reportId) {
    state.selectedReportId = reportId;
    switchScreen('extraction-view');
};

// Screen 3: Extraction View
function renderExtractionView() {
    const select = elements.selectExtractionReport;
    if (select) {
        select.innerHTML = state.reports.map(r => `
            <option value="${r.id}" ${r.id === state.selectedReportId ? 'selected' : ''}>
                #${r.id.slice(0, 8)}: ${r.raw_text.slice(0, 40)}...
            </option>
        `).join('') || '<option value="">No reports available</option>';

        if (!state.selectedReportId && state.reports.length > 0) {
            state.selectedReportId = state.reports[0].id;
        }
    }

    const currentReport = state.reports.find(r => r.id === state.selectedReportId);
    if (!currentReport) return;

    // Left card
    document.getElementById('source-report-text').textContent = currentReport.raw_text;
    document.getElementById('ext-source-type').innerHTML = `<i class="fa-solid fa-microphone"></i> Source: ${currentReport.source_type}`;
    document.getElementById('ext-submitted-by').innerHTML = `<i class="fa-solid fa-user"></i> ${currentReport.submitted_by || 'Supervisor'}`;

    // Right card - extraction data from matches/triage or fallback
    const match = state.matches.find(m => m.report_id === currentReport.id);
    const triage = state.triageItems.find(t => t.report_id === currentReport.id);
    const extraction = triage ? triage.extraction : (match ? {
        asset_id: match.activity_code.split('-')[2] || 'P-204',
        discipline: 'Mechanical',
        plant_unit: 'CDU-02',
        area: 'Pump Area',
        action: 'MECHANICAL_INSTALLATION',
        progress_percent: 80,
        delay_days: 2,
        delay_root_cause: 'MATERIAL_DELIVERY'
    } : {});

    document.getElementById('ext-asset').textContent = extraction.asset_id || 'UNKNOWN (Ambiguous)';
    document.getElementById('ext-discipline').textContent = extraction.discipline || 'Mechanical';
    document.getElementById('ext-unit').textContent = extraction.plant_unit || 'CDU-02';
    document.getElementById('ext-area').textContent = extraction.area || 'Pump Area';
    document.getElementById('ext-action').textContent = extraction.action || 'MECHANICAL_INSTALLATION';
    document.getElementById('ext-progress').textContent = `${extraction.progress_percent ?? 80}% Complete`;
    document.getElementById('ext-delay').textContent = extraction.delay_days ? `${extraction.delay_days} Days Impact` : 'No Delay';
    document.getElementById('ext-rootcause').textContent = extraction.delay_root_cause || 'None';

    const conf = match ? (match.confidence * 100).toFixed(1) : '95.0';
    document.getElementById('ext-confidence-badge').textContent = `${conf}% Confidence`;
    document.getElementById('ext-raw-json').textContent = JSON.stringify(extraction, null, 2);
}

// Screen 4: Schedule Matching Intelligence
function renderMatchingIntelligence() {
    const tbody = document.querySelector('#table-matching-matrix tbody');
    if (!tbody) return;

    if (state.matches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No matching evaluations available. Submit a report to run intelligence engine.</td></tr>';
        return;
    }

    let html = '';
    state.matches.forEach(m => {
        const confPct = (m.confidence * 100).toFixed(1);
        const decisionBadge = m.decision === 'AUTO_SYNC' ? 'badge-success' : 'badge-warning';

        html += `
            <tr>
                <td><strong>#${m.rank}</strong></td>
                <td><span class="feed-code">${m.activity_code}</span></td>
                <td>${m.activity_name}</td>
                <td>Mechanical</td>
                <td><span class="badge badge-subtle">P-204</span></td>
                <td>
                    <div style="font-family: var(--font-mono); font-size: 11px;">
                        A:${(m.asset_score * 100).toFixed(0)}% | L:${(m.location_score * 100).toFixed(0)}% | D:${(m.discipline_score * 100).toFixed(0)}% | Act:${(m.action_score * 100).toFixed(0)}%
                    </div>
                </td>
                <td><strong class="text-blue" style="font-family: var(--font-mono);">${confPct}%</strong></td>
                <td><span class="badge ${decisionBadge}">${m.decision}</span></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Screen 5: Planner Triage
function renderPlannerTriage() {
    const container = document.getElementById('triage-items-list');
    if (!container) return;

    if (state.triageItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-check text-emerald"></i>
                <h3>All Ambiguities Triaged</h3>
                <p class="text-muted">No pending schedule matches require planner intervention right now.</p>
                <button class="btn btn-outline-primary btn-sm mt-3" id="btn-load-ambiguous-demo-inner">Load Ambiguous Report Demo</button>
            </div>
        `;
        document.getElementById('btn-load-ambiguous-demo-inner')?.addEventListener('click', () => {
            switchScreen('field-reports');
            const data = PRESETS.ambiguous;
            elements.rawTextInput.value = data.text;
            elements.plantUnitInput.value = data.unit;
            elements.supervisorInput.value = data.supervisor;
        });
        return;
    }

    let html = '';
    state.triageItems.forEach(item => {
        let candidatesHtml = '';
        item.match_candidates.forEach((cand, idx) => {
            const isChecked = idx === 0 ? 'checked' : '';
            const confPct = (cand.confidence * 100).toFixed(1);
            candidatesHtml += `
                <label class="candidate-row ${idx === 0 ? 'selected' : ''}" data-act="${cand.activity_id}">
                    <input type="radio" name="cand_${item.report_id}" value="${cand.activity_id}" ${isChecked}>
                    <span class="candidate-code">${cand.activity_code}</span>
                    <span class="candidate-name">${cand.activity_name}</span>
                    <span class="candidate-conf">${confPct}% Match</span>
                </label>
            `;
        });

        html += `
            <div class="triage-card" id="triage-card-${item.report_id}">
                <div class="triage-header">
                    <div class="triage-title"><i class="fa-solid fa-triangle-exclamation"></i> Low Confidence / Missing Entity Match</div>
                    <span class="badge badge-warning">Awaiting Approval</span>
                </div>
                <div class="triage-raw-text">
                    <strong>Report Transcript:</strong> "${item.raw_text}"
                </div>

                <div class="section-sub-title">Select Intended Schedule Activity:</div>
                <div class="triage-candidate-list">
                    ${candidatesHtml || '<div class="text-muted text-sm">No candidate activities found.</div>'}
                </div>

                <div class="form-group mt-2">
                    <input type="text" class="form-control form-control-sm" id="comment-${item.report_id}" placeholder="Optional approval comment / engineering note...">
                </div>

                <div class="triage-actions">
                    <button class="btn btn-outline-danger btn-sm" onclick="rejectTriage('${item.report_id}')">
                        <i class="fa-solid fa-ban"></i> Reject Match
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="approveTriage('${item.report_id}')">
                        <i class="fa-solid fa-check"></i> Approve & Sync Schedule
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

window.approveTriage = async function(reportId) {
    const selectedRadio = document.querySelector(`input[name="cand_${reportId}"]:checked`);
    if (!selectedRadio) {
        showToast('Please select a target candidate activity', 'error');
        return;
    }
    const actId = selectedRadio.value;
    const comment = document.getElementById(`comment-${reportId}`)?.value || 'Planner verified match';

    try {
        const res = await fetch(`${API_BASE}/api/triage/${reportId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activity_id: actId,
                reviewer: 'Senior EPC Planner',
                comment: comment
            })
        });

        if (!res.ok) throw new Error('Approval failed');
        showToast('Match approved and schedule synchronized!', 'success');
        await refreshLiveData();
        renderPlannerTriage();
    } catch (err) {
        console.error(err);
        showToast('Approval error: ' + err.message, 'error');
    }
};

window.rejectTriage = async function(reportId) {
    try {
        const res = await fetch(`${API_BASE}/api/triage/${reportId}/reject`, { method: 'POST' });
        if (!res.ok) throw new Error('Reject failed');
        showToast('Triage match rejected', 'info');
        await refreshLiveData();
        renderPlannerTriage();
    } catch (err) {
        console.error(err);
        showToast('Reject error: ' + err.message, 'error');
    }
};

// Screen 6: Gantt Progress Table
function renderGantt() {
    const tbody = document.querySelector('#table-gantt tbody');
    if (!tbody) return;

    const searchTerm = elements.ganttSearch?.value.toLowerCase().trim() || '';
    const filterDisc = elements.ganttDisciplineFilter?.value || '';

    let filtered = state.activities.filter(a => {
        const matchSearch = !searchTerm || 
            a.activity_code.toLowerCase().includes(searchTerm) || 
            a.name.toLowerCase().includes(searchTerm) ||
            (a.asset_id && a.asset_id.toLowerCase().includes(searchTerm));
        const matchDisc = !filterDisc || a.discipline === filterDisc;
        return matchSearch && matchDisc;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No activities matching filter criteria.</td></tr>';
        return;
    }

    let html = '';
    filtered.slice(0, 100).forEach(act => {
        const isDelayed = act.is_delayed || (act.baseline_progress > act.actual_progress + 5);
        const statusBadge = act.status === 'COMPLETED' ? 'badge-success' : (act.status === 'IN_PROGRESS' ? 'badge-primary' : 'badge-subtle');
        const delayBadge = isDelayed ? '<span class="badge badge-danger">DELAYED</span>' : '<span class="badge badge-success">ON TRACK</span>';

        html += `
            <tr>
                <td><strong class="feed-code">${act.activity_code}</strong></td>
                <td><strong>${act.name}</strong></td>
                <td>${act.discipline || 'General'}</td>
                <td><span class="badge badge-subtle">${act.area || 'Unit 2'}</span></td>
                <td>
                    <div class="gantt-bar-cell">
                        <div class="gantt-bar-dual">
                            <div class="gantt-bar-fill ${isDelayed ? 'delayed' : 'actual'}" style="width: ${act.actual_progress}%;"></div>
                        </div>
                        <div class="gantt-meta">
                            <span>Act: <strong>${act.actual_progress}%</strong></span>
                            <span class="text-muted">Base: ${act.baseline_progress}%</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge ${statusBadge}">${act.status}</span></td>
                <td>${delayBadge}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Screen 7: Delay Intelligence
function renderDelayIntelligence() {
    const totalDelays = state.delays.length;
    const totalDays = state.delays.reduce((acc, d) => acc + (d.delay_days || 0), 0);

    // Root cause count
    const causes = {};
    state.delays.forEach(d => {
        causes[d.root_cause] = (causes[d.root_cause] || 0) + (d.delay_days || 1);
    });

    const topCause = Object.keys(causes).sort((a, b) => causes[b] - causes[a])[0] || 'None';

    document.getElementById('delay-total-incidents').textContent = totalDelays;
    document.getElementById('delay-total-days').textContent = totalDays;
    document.getElementById('delay-top-cause').textContent = topCause.replace(/_/g, ' ');

    // Render bars
    const rootList = document.getElementById('rootcause-distribution-list');
    if (rootList) {
        if (totalDelays === 0) {
            rootList.innerHTML = '<div class="text-muted text-center py-3">No root cause delays logged.</div>';
        } else {
            let barsHtml = '';
            Object.keys(causes).forEach(cause => {
                const days = causes[cause];
                const pct = totalDays > 0 ? ((days / totalDays) * 100).toFixed(0) : 0;
                barsHtml += `
                    <div class="rootcause-row">
                        <div class="rootcause-meta">
                            <span>${cause.replace(/_/g, ' ')}</span>
                            <span><strong>${days} Days</strong> (${pct}%)</span>
                        </div>
                        <div class="rootcause-track">
                            <div class="rootcause-fill" style="width: ${pct}%;"></div>
                        </div>
                    </div>
                `;
            });
            rootList.innerHTML = barsHtml;
        }
    }

    // Delay Table
    const tbody = document.querySelector('#table-delay-events tbody');
    if (tbody) {
        if (state.delays.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No delay events recorded in register.</td></tr>';
            return;
        }

        let html = '';
        state.delays.forEach(d => {
            html += `
                <tr>
                    <td class="text-muted text-sm">${new Date(d.created_at).toLocaleString()}</td>
                    <td><strong class="feed-code">${d.activity_code}</strong></td>
                    <td>${d.activity_name}</td>
                    <td><span class="badge badge-danger">+${d.delay_days} Days</span></td>
                    <td><span class="badge badge-warning">${d.root_cause}</span></td>
                    <td>${d.description || 'Field report delay flag'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }
}

// Screen 8: Audit Trail
function renderAuditTrail() {
    const tbody = document.querySelector('#table-audit-trail tbody');
    if (!tbody) return;

    if (state.auditEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No audit events generated yet.</td></tr>';
        return;
    }

    let html = '';
    state.auditEvents.forEach(aud => {
        const oldVal = aud.old_value_json?.actual_progress ?? '-';
        const newVal = aud.new_value_json?.actual_progress ?? '-';
        const actorBadge = aud.actor_type === 'SYSTEM' ? 'badge-primary' : 'badge-warning';
        const decisionBadge = aud.decision === 'AUTO_SYNC' ? 'badge-success' : 'badge-info';

        html += `
            <tr>
                <td class="text-muted text-sm">${new Date(aud.created_at).toLocaleString()}</td>
                <td><span class="badge ${actorBadge}">${aud.actor_type} (${aud.actor_id || 'AI_ENGINE'})</span></td>
                <td><span class="badge badge-subtle">${aud.event_type}</span></td>
                <td><strong>${aud.activity_code || 'General'}</strong><br><span class="text-muted text-sm">${aud.activity_name || ''}</span></td>
                <td><span class="text-muted">${oldVal}%</span> &rarr; <strong class="text-emerald">${newVal}%</strong></td>
                <td><span class="badge ${decisionBadge}">${aud.decision || 'UPDATE'}</span></td>
                <td>${aud.reason || 'Telemetry sync'}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}
