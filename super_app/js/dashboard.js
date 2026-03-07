// DASHBOARD MODULE
function renderDashboard() {
    try {
        if (!dashboardData) return;
        const d = dashboardData;

        // Header Stats
        if (ui.lastContest) ui.lastContest.innerText = `#${d.concurso || '----'}`;
        if (ui.totalContests) ui.totalContests.innerText = `${d.total_concursos || 0} CONCURSOS`;

        // Last Sorteio
        if (ui.lastNumbers && d.dezenas) {
            ui.lastNumbers.innerHTML = d.dezenas.map(n => `
                <div class="loto-ball active">${String(n).padStart(2, '0')}</div>
            `).join('');
        }

        // Quick Stats
        const freqArr = d.frequencia_10 ? Object.values(d.frequencia_10) : [];
        const hotCount = freqArr.filter(v => v >= 7).length;
        if (ui.hotCount) ui.hotCount.innerText = hotCount;

        const delayArr = d.atrasos ? Object.values(d.atrasos) : [];
        const critDelays = delayArr.filter(v => v >= 5).length;
        if (ui.delayCount) ui.delayCount.innerText = critDelays;

        // Heatmap
        if (ui.heatmap) {
            ui.heatmap.innerHTML = '';
            for (let n = 1; n <= 25; n++) {
                const freq = d.frequencia_total ? (d.frequencia_total[n] || 0) : 0;
                const ratio = d.total_concursos ? (freq / d.total_concursos) : 0;
                const opacity = 0.1 + (ratio * 1.5);
                const delay = d.atrasos ? (d.atrasos[n] || 0) : 0;
                const isDestaque = delay === 0;
                const isHot = d.frequencia_10 ? ((d.frequencia_10[n] || 0) >= 7) : false;

                ui.heatmap.innerHTML += `
                    <div class="relative glass-card p-4 rounded-2xl border-t border-white/5 text-center group transition ${isHot ? 'hot-glow border-purple-500/50' : ''}">
                        <div class="absolute inset-0 bg-emerald-500 rounded-2xl" style="opacity: ${opacity}"></div>
                        <p class="relative text-lg font-black ${isDestaque ? 'text-white' : 'text-slate-400'}">${String(n).padStart(2, '0')}</p>
                        <p class="relative text-[9px] font-bold text-slate-500 uppercase mt-1">Atraso: ${delay}</p>
                    </div>
                `;
            }
        }

        // Simple Suggestion
        if (ui.suggestionBalls && d.frequencia_10) {
            const sorted = Object.entries(d.frequencia_10)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15)
                .map(x => x[0])
                .sort((a, b) => a - b);

            ui.suggestionBalls.innerHTML = sorted.map(n => `
                <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-bold text-slate-300">
                    ${String(n).padStart(2, '0')}
                </div>
            `).join('');
        }

        // Cycle Tracker [NEW Phase 8]
        const missingCycle = d.missing_cycle || [];
        const cycleProgress = ((25 - missingCycle.length) / 25) * 100;

        const cycleBar = document.getElementById('cycle-progress-bar');
        const cyclePercent = document.getElementById('cycle-percentage');
        const cycleBalls = document.getElementById('missing-cycle-balls');

        if (cycleBar) cycleBar.style.width = `${cycleProgress}%`;
        if (cyclePercent) cyclePercent.innerText = `${cycleProgress}% CONCLUÍDO`;
        if (cycleBalls) {
            if (missingCycle.length === 0) {
                cycleBalls.innerHTML = `<p class="text-[10px] text-emerald-400 font-bold uppercase">Ciclo concluído! Novo ciclo inicia no próximo sorteio.</p>`;
            } else {
                cycleBalls.innerHTML = missingCycle.sort((a, b) => a - b).map(n => `
                    <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">
                        ${String(n).padStart(2, '0')}
                    </div>
                `).join('');
            }
        }

        if (window.refreshIcons) refreshIcons();
    } catch (err) {
        console.warn("Aviso na renderização do dashboard:", err);
    }
}
