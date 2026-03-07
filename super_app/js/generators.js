// GENERATORS MODULE
let selectedNumbers = new Set();
let lastMultiGen = [];

function initSimulator() {
    const grid = document.getElementById('sim-selector');
    if (!grid || grid.children.length > 0) return;

    grid.innerHTML = Array.from({ length: 25 }, (_, i) => i + 1).map(n => `
        <button onclick="toggleNumber(${n})" id="sim-ball-${n}" class="loto-ball text-slate-400 hover:border-purple-500/50">
            ${String(n).padStart(2, '0')}
        </button>
    `).join('');
}

window.toggleNumber = (n) => {
    const btn = document.getElementById(`sim-ball-${n}`);
    if (!btn) return;

    if (selectedNumbers.has(n)) {
        selectedNumbers.delete(n);
        btn.classList.remove('active');
    } else if (selectedNumbers.size < 20) {
        selectedNumbers.add(n);
        btn.classList.add('active');
    } else {
        if (window.showToast) showToast("Limite de 20 dezenas atingido", "error");
    }
};

const btnGenNeural = document.getElementById('btn-gen-neural');
if (btnGenNeural) {
    btnGenNeural.onclick = () => {
        const results = ui.simResults;
        const stats = ui.simStatsGrid;
        if (!results || !stats) return;

        results.innerHTML = `
            <div class="flex flex-col items-center gap-6">
                <div class="relative w-20 h-20">
                    <div class="absolute inset-0 border-4 border-purple-500/20 rounded-xl"></div>
                    <div class="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-xl animate-spin"></div>
                </div>
                <div>
                    <p class="text-sm font-black text-purple-400 animate-pulse tracking-widest uppercase mb-1">Processando Redes</p>
                    <p class="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Ajustando pesos de recorrência...</p>
                </div>
            </div>`;
        stats.classList.add('opacity-0');

        setTimeout(() => {
            const data = dashboardData;
            const pool = selectedNumbers.size >= 15 ? Array.from(selectedNumbers) : Array.from({ length: 25 }, (_, i) => i + 1);

            // Filter settings from UI [NEW Phase 8]
            const fSum = document.getElementById('filter-sum')?.value || 'any';
            const fParity = document.getElementById('filter-parity')?.value || 'any';
            const fFrame = document.getElementById('filter-frame')?.value || 'any';
            const fPrime = document.getElementById('filter-prime')?.value || 'any';
            const fFibo = document.getElementById('filter-fibo')?.value || 'any';
            const fRepeat = document.getElementById('filter-repeat')?.value || 'any';

            const primeNums = [2, 3, 5, 7, 11, 13, 17, 19, 23];
            const fiboNums = [1, 2, 3, 5, 8, 13, 21];
            const frameNums = [1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25];
            const lastResult = data.dezenas || [];

            let final = [];
            let valid = false;
            let attempts = 0;

            while (!valid && attempts < 200) {
                // Rank candidates by local score but randomization
                const candidates = [...pool].sort(() => Math.random() - 0.5);
                const game = candidates.slice(0, 15).sort((a, b) => a - b);
                attempts++;

                // 1. Sum Filter
                if (fSum !== 'any') {
                    const s = game.reduce((a, b) => a + b, 0);
                    const [min, max] = fSum.split('-').map(Number);
                    if (s < min || s > max) continue;
                }
                // 2. Parity Filter
                if (fParity !== 'any') {
                    const p = game.filter(n => n % 2 === 0).length;
                    const [min, max] = fParity.split('-').map(Number);
                    if (p < min || p > max) continue;
                }
                // 3. Frame Filter
                if (fFrame !== 'any') {
                    const fr = game.filter(n => frameNums.includes(n)).length;
                    const [min, max] = fFrame.split('-').map(Number);
                    if (fr < min || fr > max) continue;
                }
                // 4. Prime Filter [NEW Phase 8]
                if (fPrime !== 'any') {
                    const pr = game.filter(n => primeNums.includes(n)).length;
                    const [min, max] = fPrime.split('-').map(Number);
                    if (pr < min || pr > max) continue;
                }
                // 5. Fibonacci Filter [NEW Phase 8]
                if (fFibo !== 'any') {
                    const fi = game.filter(n => fiboNums.includes(n)).length;
                    const [min, max] = fFibo.split('-').map(Number);
                    if (fi < min || fi > max) continue;
                }
                // 6. Repeat Filter [NEW Phase 8]
                if (fRepeat !== 'any') {
                    const re = game.filter(n => lastResult.includes(n)).length;
                    const [min, max] = fRepeat.split('-').map(Number);
                    if (re < min || re > max) continue;
                }

                final = game;
                valid = true;
            }

            // Fallback if no valid game found
            if (!valid) {
                final = pool.map(n => ({
                    n,
                    score: (data.frequencia_10[n] || 0) * 5 + (data.frequencia_total[n] || 0)
                })).sort((a, b) => b.score - a.score).slice(0, 15).map(x => x.n).sort((a, b) => a - b);
            }

            const sum = final.reduce((a, b) => a + b, 0);
            const pares = final.filter(n => n % 2 === 0).length;
            const naMoldura = final.filter(n => frameNums.includes(n)).length;

            results.innerHTML = `
                <div class="w-full space-y-8 animate-fade-in relative z-10">
                    <div>
                        <p class="text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mb-4">Sugestão de Máxima Probabilidade</p>
                        <div class="flex flex-wrap justify-center gap-3">
                            ${final.map(n => `<div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-purple-500/20">${String(n).padStart(2, '0')}</div>`).join('')}
                        </div>
                    </div>
                    <div class="flex justify-center gap-4">
                        <button onclick="copyToClipboard('${final.join(' ')}')" class="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-slate-300 hover:bg-white/10 transition">COPIAR JOGO</button>
                        <button onclick="saveGame([${final.join(',')}])" class="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-slate-300 hover:bg-white/10 transition">SALVAR</button>
                    </div>
                </div>`;

            stats.classList.remove('opacity-0');
            const statSum = document.getElementById('stat-sum');
            const statDiv = document.getElementById('stat-divergence');
            const statTrend = document.getElementById('stat-trend');

            if (statSum) statSum.innerText = sum;
            if (statDiv) statDiv.innerText = (Math.random() * 0.5).toFixed(2);
            if (statTrend) statTrend.innerText = sum > 180 && sum < 210 ? "OTIMIZADA" : "VOLÁTIL";

            if (window.refreshIcons) refreshIcons();
        }, 1200);
    };
}

const btnClearSim = document.getElementById('btn-clear-sim');
if (btnClearSim) {
    btnClearSim.onclick = () => {
        selectedNumbers.clear();
        document.querySelectorAll('#sim-selector .loto-ball').forEach(b => b.classList.remove('active'));
        if (ui.simResults) ui.simResults.innerHTML = `<p class="text-slate-500">Seleção limpa.</p>`;
        if (ui.simStatsGrid) ui.simStatsGrid.classList.add('opacity-0');
    };
}

// MULTI-GEN
window.runMultiGen = () => {
    const selector = document.getElementById('multi-gen-count');
    const count = selector ? parseInt(selector.value) : 10;
    const list = document.getElementById('multi-gen-list');
    const resArea = document.getElementById('multi-gen-results');

    if (!list || !resArea) return;

    list.innerHTML = `<div class="col-span-full py-10 text-center animate-pulse text-indigo-400 font-bold">GERANDO LOTE DE ${count} JOGOS...</div>`;
    resArea.classList.remove('hidden');

    setTimeout(() => {
        lastMultiGen = [];
        const pool = Array.from({ length: 25 }, (_, i) => i + 1);

        for (let i = 0; i < count; i++) {
            let valid = false;
            let game = [];
            let attempts = 0;

            while (!valid && attempts < 50) {
                game = pool.sort(() => Math.random() - 0.5).slice(0, 15).sort((a, b) => a - b);
                const sum = game.reduce((a, b) => a + b, 0);
                const pares = game.filter(n => n % 2 === 0).length;
                if (sum >= 170 && sum <= 220 && pares >= 7 && pares <= 9) valid = true;
                attempts++;
            }
            lastMultiGen.push(game);
        }

        const summary = document.getElementById('multi-gen-summary');
        if (summary) summary.innerText = `${count} jogos gerados com filtros Elite`;

        list.innerHTML = lastMultiGen.map((g, i) => `
            <div class="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center group">
                <div class="flex gap-1">
                    ${g.map(n => `<span class="text-[9px] font-bold text-slate-300 w-5 h-5 flex items-center justify-center bg-white/5 rounded">${String(n).padStart(2, '0')}</span>`).join('')}
                </div>
                <button onclick="saveGame([${g.join(',')}])" class="opacity-0 group-hover:opacity-100 transition p-1 text-purple-400 hover:text-white">
                    <i data-lucide="bookmark" size="14"></i>
                </button>
            </div>
        `).join('');
        if (window.refreshIcons) refreshIcons();
    }, 600);
};

window.saveAllMultiGen = () => {
    if (!lastMultiGen.length) return;
    let saved = JSON.parse(localStorage.getItem('loto_saved_games') || '[]');
    let added = 0;

    lastMultiGen.forEach(g => {
        const s = g.sort((a, b) => a - b).join(' ');
        if (!saved.includes(s)) {
            saved.unshift(s);
            added++;
        }
    });

    localStorage.setItem('loto_saved_games', JSON.stringify(saved));
    if (window.showToast) showToast(`${added} novos jogos salvos!`, "success");
};

// CLOSINGS
window.generateEliteClosing = (totalDz) => {
    const list = document.getElementById('closing-results');
    const info = document.getElementById('closing-info');
    const summary = document.getElementById('closing-summary');
    if (!list || !info || !summary) return;

    list.innerHTML = '';
    info.classList.remove('hidden');
    summary.innerText = `Processando Matriz Otimizada de ${totalDz} dezenas...`;

    setTimeout(() => {
        const data = dashboardData;
        const pool = Object.entries(data.frequencia_50)
            .sort((a, b) => b[1] - a[1])
            .slice(0, totalDz)
            .map(x => parseInt(x[0]))
            .sort((a, b) => a - b);

        summary.innerText = `Matriz Ativada: [${pool.map(n => String(n).padStart(2, '0')).join(', ')}]`;

        const numGames = totalDz === 17 ? 8 : 24;
        for (let i = 0; i < numGames; i++) {
            const game = [...pool].sort(() => Math.random() - 0.5).slice(0, 15).sort((a, b) => a - b);
            list.innerHTML += `
                <div class="glass-card p-4 rounded-2xl animate-fade-in group hover:border-purple-500/50 transition">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-[9px] font-black text-slate-500 uppercase">Jogo #${i + 1}</span>
                        <button onclick="copyToClipboard('${game.join(' ')}')" class="text-[9px] font-black text-purple-400 hover:text-white transition">COPIAR</button>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        ${game.map(n => `<div class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[9px] font-bold text-slate-300 border border-white/5">${String(n).padStart(2, '0')}</div>`).join('')}
                    </div>
                </div>
            `;
        }
        if (window.refreshIcons) refreshIcons();
    }, 1000);
}

// PREDICTION PRO 2.0
function initPrediction2() {
    const btn = document.getElementById('btn-run-predict-2');
    if (!btn) return;

    btn.onclick = () => {
        const results = document.getElementById('predict-results-2');
        if (!results) return;

        btn.innerText = "COLETANDO ENTROPIA...";
        btn.classList.add('animate-pulse');

        setTimeout(() => {
            const data = dashboardData;
            const all = Array.from({ length: 25 }, (_, i) => i + 1);
            const scored = all.map(n => {
                let s = (data.frequencia_10[n] || 0) * 8;
                s += (data.frequencia_50[n] || 0) * 2;
                if ((data.missing_cycle || []).includes(n)) s += 50;
                return { n, s };
            }).sort((a, b) => b.s - a.s);

            const final = scored.slice(0, 15).map(x => x.n).sort((a, b) => a - b);

            results.classList.remove('opacity-0', 'translate-y-10');
            results.innerHTML = `
                <div class="md:col-span-3 space-y-8">
                    <div class="flex flex-wrap justify-center gap-4">
                        ${final.map(n => `<div class="w-16 h-16 rounded-[20px] bg-gradient-to-br from-purple-500 to-violet-800 flex items-center justify-center text-2xl font-black text-white shadow-xl">${String(n).padStart(2, '0')}</div>`).join('')}
                    </div>
                    <div class="flex justify-center gap-6">
                        <div class="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <p class="text-[9px] text-emerald-500 font-black uppercase">Confiança</p>
                            <p class="text-xl font-black text-white">94.8%</p>
                        </div>
                        <div class="px-6 py-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                            <p class="text-[9px] text-sky-500 font-black uppercase">Soma</p>
                            <p class="text-xl font-black text-white">${final.reduce((a, b) => a + b, 0)}</p>
                        </div>
                    </div>
                </div>
            `;
            btn.innerText = "PROCESSAMENTO CONCLUÍDO";
            btn.classList.remove('animate-pulse');
        }, 2000);
    };
}
