const API_BASE = '/api';

const api = {
    async get(endpoint) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(`API GET Error (${endpoint}):`, e);
            throw e;
        }
    },
    
    async post(endpoint, data) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(`API POST Error (${endpoint}):`, e);
            throw e;
        }
    },

    // Specific endpoints based on backend routes
    dashboard: {
        getStats: () => api.get('/projects/stats'),
        getTimeline: () => api.get('/projects/timeline')
    },
    triage: {
        getQueue: () => api.get('/triage/'),
        resolve: (id, data) => api.post(`/triage/${id}/resolve`, data)
    },
    delays: {
        query: (text) => api.post('/delays/query', { query: text }),
        getList: () => api.get('/delays/')
    },
    audit: {
        getLog: () => api.get('/audit/')
    },
    whatsapp: {
        simulate: (data) => api.post('/whatsapp/webhook', data) // Takes phone_number, sender_name, message_type, message_body
    },
    p6: {
        exportXer: () => window.location.href = `${API_BASE}/p6/export/xer`
    }
};

window.api = api;
