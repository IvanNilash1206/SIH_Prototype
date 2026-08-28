class AppRouter {
    constructor() {
        this.currentView = null;
        this.contentContainer = document.getElementById('app-content');
        this.pageTitle = document.getElementById('page-title');
        this.pageSubtitle = document.getElementById('page-subtitle');
        this.navItems = document.querySelectorAll('.nav-item');
        
        this.views = {
            'dashboard': { title: 'Dashboard', subtitle: 'Project Overview & Analytics', init: this.initDashboard.bind(this) },
            'ingestion': { title: 'Field Ingestion', subtitle: 'Upload Multi-modal Reports', init: this.initIngestion.bind(this) },
            'triage': { title: 'Planner Triage', subtitle: 'Review Ambiguous Matches', init: this.initTriage.bind(this) },
            'delays': { title: 'Delay Intelligence', subtitle: 'AI-Powered Bottleneck Analysis', init: this.initDelays.bind(this) },
            'audit': { title: 'Audit Log', subtitle: 'Tamper-Evident History Trail', init: this.initAudit.bind(this) }
        };

        this.init();
    }

    init() {
        // Setup navigation listeners
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = item.getAttribute('data-view');
                this.navigate(viewName);
                
                // Update URL hash
                window.location.hash = viewName;
            });
        });

        // Handle initial load based on hash, default to dashboard
        const initialHash = window.location.hash.replace('#', '') || 'dashboard';
        this.navigate(initialHash);

        // Global Event Listeners
        document.getElementById('export-p6-btn').addEventListener('click', () => {
            window.api.p6.exportXer();
        });

        // Start background polling for triage count
        this.pollTriageCount();
        setInterval(() => this.pollTriageCount(), 30000); // 30s
    }

    async pollTriageCount() {
        try {
            // Might need to adapt depending on backend response shape
            // Just swallowing errors for demo
            const queue = await window.api.triage.getQueue();
            const count = queue.length || 0;
            const badge = document.getElementById('triage-badge');
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
                badge.className = 'badge danger';
            } else {
                badge.style.display = 'none';
            }
        } catch (e) {
            console.log('Triage polling failed gently');
        }
    }

    async navigate(viewName) {
        if (!this.views[viewName]) viewName = 'dashboard';
        
        // Update Nav Active State
        this.navItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`.nav-item[data-view="${viewName}"]`).classList.add('active');

        // Update Header
        const viewConfig = this.views[viewName];
        this.pageTitle.textContent = viewConfig.title;
        this.pageSubtitle.textContent = viewConfig.subtitle;

        // Show loading state
        this.contentContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading ${viewConfig.title}...</p>
            </div>
        `;

        // Fetch View HTML
        try {
            const response = await fetch(`/static/views/${viewName}.html`);
            if (!response.ok) throw new Error('View not found');
            const html = await response.text();
            
            // Artificial slight delay for smooth transition feel
            setTimeout(() => {
                this.contentContainer.innerHTML = html;
                // Initialize view logic
                if (viewConfig.init) {
                    viewConfig.init();
                }
            }, 300);

        } catch (error) {
            this.contentContainer.innerHTML = `
                <div class="card" style="border-color: var(--danger);">
                    <h3 class="text-danger">Error Loading View</h3>
                    <p>Failed to load ${viewName}. Please ensure the files exist in /static/views/</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 10px;">${error.message}</p>
                </div>
            `;
        }
    }

    // View Initializers
    initDashboard() {
        // Will be populated by static/js/dashboard.js if we decide to split, or inline here.
        // Let's rely on global functions loaded dynamically or script tags.
        // For simplicity, we can load a script tag dynamically.
        this.loadScript(`/static/js/${this.currentView || window.location.hash.replace('#', '') || 'dashboard'}.js`);
    }

    initIngestion() { this.loadScript('/static/js/ingestion.js'); }
    initTriage() { this.loadScript('/static/js/triage.js'); }
    initDelays() { this.loadScript('/static/js/delays.js'); }
    initAudit() { this.loadScript('/static/js/audit.js'); }

    loadScript(src) {
        // Remove old dynamic scripts to prevent duplication
        const oldScript = document.querySelector(`script[src^="${src}"]`);
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.src = src + '?v=' + new Date().getTime(); // cache bust
        document.body.appendChild(script);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new AppRouter();
});
