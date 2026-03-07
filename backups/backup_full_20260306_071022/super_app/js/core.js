// LOTOMATRIX CORE (Navigation & State)
let dashboardData = null;

const ui = {
    overlay: document.getElementById('loading-overlay'),
    views: document.querySelectorAll('.content-view'),
    navBtns: document.querySelectorAll('.sidebar-item'),
    lastContest: document.getElementById('last-contest-id'),
    lastNumbers: document.getElementById('last-numbers'),
    totalContests: document.getElementById('total-contests'),
    heatmap: document.getElementById('heatmap-grid'),
    hotCount: document.getElementById('hot-count'),
    delayCount: document.getElementById('delay-count'),
    suggestionBalls: document.getElementById('suggestion-balls'),
    simResults: document.getElementById('sim-results'),
    simStatsGrid: document.getElementById('sim-stats-grid'),
    viewTitle: document.getElementById('view-title')
};

// 1. DATA FETCHING
async function loadCoreData() {
    try {
        const res = await fetch('../data/dashboard_data.json?v=' + Date.now());
        if (!res.ok) throw new Error('Falha ao ler dados');
        dashboardData = await res.json();

        if (window.renderDashboard) renderDashboard();
    } catch (err) {
        console.error("Erro crítico no boot:", err);
        if (window.showToast) showToast("Erro ao carregar banco de dados", "error");
    } finally {
        setTimeout(() => {
            if (ui.overlay) ui.overlay.classList.add('hidden');
        }, 1000);
    }
}

// 2. NAVIGATION
function initNavigation() {
    if (!ui.navBtns) return;

    ui.navBtns.forEach(btn => {
        btn.onclick = () => {
            const target = btn.getAttribute('data-view');

            // Toggle Sidebar items
            ui.navBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.add('text-slate-400');
            });
            btn.classList.add('active');
            btn.classList.remove('text-slate-400');

            // Switch Views
            ui.views.forEach(v => v.classList.add('hidden'));
            const targetView = document.getElementById(`view-${target}`);
            if (targetView) targetView.classList.remove('hidden');

            // Update Title
            if (ui.viewTitle) ui.viewTitle.innerText = btn.innerText.trim();

            // Component Inits
            if (target === 'panorama' && window.renderPanorama) renderPanorama();
            if (target === 'simulator' && window.initSimulator) initSimulator();
            if (target === 'history' && window.renderHistory) renderHistory();
            if (target === 'prediction' && window.initPrediction2) initPrediction2();
            if (target === 'analytics' && window.initAnalyticsPlus) initAnalyticsPlus();
            if (target === 'saved' && window.renderSaved) renderSaved();
            if (target === 'multi-gen') {
                const resArea = document.getElementById('multi-gen-results');
                if (resArea) resArea.classList.add('hidden');
            }
            if (target === 'comparator') {
                const contestId = document.getElementById('comp-contest-id');
                if (contestId) contestId.innerText = dashboardData?.concurso || '----';
            }
            if (target === 'trends' && window.initTrendCharts) initTrendCharts();

            if (window.refreshIcons) refreshIcons();
        };
    });
}

// BOOT
window.addEventListener('load', () => {
    loadCoreData();
    initNavigation();
    if (window.refreshIcons) refreshIcons();
});

// Refresh Button
const refreshBtn = document.getElementById('btn-refresh');
if (refreshBtn) {
    refreshBtn.onclick = () => {
        if (ui.overlay) ui.overlay.classList.remove('hidden');
        loadCoreData();
    };
}

// Theme Toggle [NEW Phase 8]
const themeBtn = document.getElementById('btn-theme-toggle');
const themeIcon = document.getElementById('theme-icon');
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('theme-nexus');
        const isNexus = document.body.classList.contains('theme-nexus');
        if (themeIcon) {
            themeIcon.setAttribute('data-lucide', isNexus ? 'moon' : 'sun');
            themeIcon.classList.toggle('text-yellow-400', !isNexus);
            themeIcon.classList.toggle('text-indigo-400', isNexus);
        }
        if (window.refreshIcons) refreshIcons();
    };
}
