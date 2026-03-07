// LOTOMATRIX UTILITIES
function showToast(msg, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `glass-card p-4 rounded-2xl flex items-center gap-4 animate-fade-in border-l-4 ${type === 'error' ? 'border-rose-500' : 'border-emerald-500'}`;
    toast.innerHTML = `
        <i data-lucide="${type === 'error' ? 'alert-octagon' : 'check-circle'}" class="${type === 'error' ? 'text-rose-500' : 'text-emerald-500'}" size="20"></i>
        <p class="text-xs font-bold text-white">${msg}</p>
    `;
    container.appendChild(toast);

    if (window.lucide) {
        lucide.createIcons();
    }

    setTimeout(() => toast.remove(), 4000);
}

window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Jogo copiado para o clipboard!", "success");
    }).catch(() => {
        showToast("Erro ao copiar para o clipboard", "error");
    });
};

// Global Lucide helper
window.refreshIcons = () => {
    if (window.lucide) lucide.createIcons();
};
