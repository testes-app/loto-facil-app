// SAVED GAMES, HISTORY & COMPARATOR
function renderSaved() {
    const list = document.getElementById('saved-games-list');
    if (!list) return;

    const saved = JSON.parse(localStorage.getItem('loto_saved_games') || '[]');

    if (saved.length === 0) {
        list.innerHTML = `
            <div class="col-span-full py-20 text-center opacity-20">
                <i data-lucide="bookmark-x" size="48" class="mx-auto mb-4"></i>
                <p class="text-xs font-black uppercase tracking-widest">Nenhum jogo salvo</p>
            </div>`;
    } else {
        list.innerHTML = saved.map((game, idx) => `
            <div class="glass-card p-6 rounded-[24px] border border-white/5 hover:border-purple-500/30 transition group">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-[10px] font-black text-slate-500 uppercase">Salvo #${saved.length - idx}</span>
                    <button onclick="removeSaved(${idx})" class="text-rose-500 opacity-0 group-hover:opacity-100 transition hover:scale-110">
                        <i data-lucide="trash-2" size="14"></i>
                    </button>
                </div>
                <div class="flex flex-wrap gap-1.5 mb-6">
                    ${game.split(' ').map(n => `<div class="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-[10px] font-bold text-slate-300 border border-white/5">${n}</div>`).join('')}
                </div>
                <div class="grid grid-cols-2 gap-3">
                     <button onclick="copyToClipboard('${game}')" class="py-2 rounded-xl bg-white/5 text-[9px] font-black text-slate-400 hover:text-white transition uppercase">Copiar</button>
                     <button onclick="testSavedGame('${game}')" class="py-2 rounded-xl bg-purple-600/20 text-[9px] font-black text-purple-400 hover:bg-purple-600/30 transition uppercase">Análise</button>
                </div>
            </div>
        `).join('');
    }
    if (window.refreshIcons) refreshIcons();
}

window.saveGame = (nums) => {
    let saved = JSON.parse(localStorage.getItem('loto_saved_games') || '[]');
    const s = nums.sort((a, b) => a - b).map(n => String(n).padStart(2, '0')).join(' ');

    if (saved.includes(s)) {
        if (window.showToast) showToast("Este jogo já está salvo!", "info");
        return;
    }

    saved.unshift(s);
    localStorage.setItem('loto_saved_games', JSON.stringify(saved));
    if (window.showToast) showToast("Jogo salvo com sucesso!", "success");
    renderSaved();
};

window.removeSaved = (idx) => {
    let saved = JSON.parse(localStorage.getItem('loto_saved_games') || '[]');
    saved.splice(idx, 1);
    localStorage.setItem('loto_saved_games', JSON.stringify(saved));
    renderSaved();
};

window.clearAllSaved = () => {
    if (confirm("Deseja apagar TODOS os jogos salvos?")) {
        localStorage.removeItem('loto_saved_games');
        renderSaved();
        if (window.showToast) showToast("Memória limpa!", "success");
    }
};

window.exportSavedToTXT = () => {
    const saved = JSON.parse(localStorage.getItem('loto_saved_games') || '[]');
    if (saved.length === 0) return showToast("Nenhum jogo para exportar", "info");

    const content = "LOTOMATRIX - JOGOS SALVOS\n" + "=".repeat(30) + "\n\n" + saved.join("\n");
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jogos_lotomatrix_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    showToast("Exportação iniciada", "success");
};

window.exportSavedToCSV = () => {
    const saved = JSON.parse(localStorage.getItem('loto_saved_games') || '[]');
    if (saved.length === 0) return showToast("Nenhum jogo para exportar", "info");

    const header = "JOGO,D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,D11,D12,D13,D14,D15\n";
    const rows = saved.map((game, i) => {
        const parts = game.split(' ');
        return `Jogo ${saved.length - i},${parts.join(',')}`;
    }).join("\n");

    const content = header + rows;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jogos_lotomatrix_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    if (window.showToast) showToast("Exportação CSV iniciada", "success");
};

// HISTORY
function renderHistory() {
    const body = document.getElementById('history-table-body');
    if (!body || !dashboardData) return;

    const data = dashboardData.history || [];
    body.innerHTML = data.slice(0, 50).map((game, i) => {
        const concurso = dashboardData.concurso - i;
        const sum = game.reduce((a, b) => a + b, 0);
        return `
            <tr class="border-t border-white/5 hover:bg-white/5 transition">
                <td class="px-8 py-4 font-black text-purple-400">#${concurso}</td>
                <td class="px-8 py-4">
                    <div class="flex flex-wrap gap-2">
                        ${game.map(n => `<span class="text-xs font-bold text-slate-300">${String(n).padStart(2, '0')}</span>`).join(' ')}
                    </div>
                </td>
                <td class="px-8 py-4 font-bold text-slate-500">${sum}</td>
            </tr>
        `;
    }).join('');
}

// PERFORMANCE PRO
window.runPerformanceTest = (manualNumbers = null) => {
    const input = document.getElementById('perf-numbers');
    const resultsDiv = document.getElementById('perf-results');
    const rawStr = manualNumbers || (input ? input.value : null);

    if (!rawStr) return showToast("Insira as dezenas para testar", "error");

    const numbers = rawStr.split(/[\s,.-]+/).map(n => parseInt(n)).filter(n => n >= 1 && n <= 25);
    if (numbers.length < 15) return showToast("Insira ao menos 15 dezenas", "error");

    if (resultsDiv) {
        resultsDiv.innerHTML = `<div class="col-span-full py-20 text-center animate-pulse"><p class="text-purple-400 font-black">PROCESSANDO 3600+ CONCURSOS...</p></div>`;
        resultsDiv.classList.remove('hidden');
    }

    setTimeout(() => {
        const hits = { 11: 0, 12: 0, 13: 0, 14: 0, 15: 0 };
        const history = dashboardData.history || [];

        history.forEach(draw => {
            const matchCount = draw.filter(n => numbers.includes(n)).length;
            if (matchCount >= 11) hits[matchCount]++;
        });

        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                    <p class="text-[9px] text-slate-500 font-black uppercase mb-1">11 Pontos</p>
                    <p class="text-xl font-black text-white">${hits[11]}</p>
                </div>
                <div class="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                    <p class="text-[10px] text-slate-500 font-black uppercase mb-1">12 Pontos</p>
                    <p class="text-xl font-black text-white">${hits[12]}</p>
                </div>
                <div class="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                    <p class="text-[10px] text-slate-500 font-black uppercase mb-1">13 Pontos</p>
                    <p class="text-xl font-black text-white">${hits[13]}</p>
                </div>
                <div class="p-6 rounded-3xl bg-white/5 border border-rose-500/20 text-center">
                    <p class="text-[10px] text-rose-400 font-black uppercase mb-1">14 Pontos</p>
                    <p class="text-xl font-black text-rose-500">${hits[14]}</p>
                </div>
                <div class="p-6 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p class="text-[10px] text-emerald-500 font-black uppercase mb-1">15 Pontos</p>
                    <p class="text-xl font-black text-emerald-400">${hits[15]}</p>
                </div>
            `;
        }
    }, 600);
};

window.testSavedGame = (gameStr) => {
    const btns = document.querySelectorAll('.sidebar-item');
    btns.forEach(b => { if (b.getAttribute('data-view') === 'analytics') b.click(); });
    const input = document.getElementById('perf-numbers');
    if (input) input.value = gameStr;
    runPerformanceTest(gameStr);
};

// COMPARATOR
window.loadSavedIntoComparator = () => {
    const saved = JSON.parse(localStorage.getItem('loto_saved_games') || '[]');
    if (!saved.length) return showToast("Nenhum jogo salvo", "info");
    const input = document.getElementById('comp-manual-input');
    if (input) input.value = saved.join('\n');
    showToast("Jogos carregados", "success");
};

window.runComparison = () => {
    const input = document.getElementById('comp-manual-input');
    const text = input ? input.value : "";
    const resultsArea = document.getElementById('comp-results-area');
    const winnerNumbers = dashboardData.dezenas;

    if (!text.trim()) return showToast("Insira ao menos um jogo", "error");

    const gamesRaw = text.split('\n').filter(l => l.trim() !== '');
    let html = `
        <div class="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div class="col-span-full flex justify-between items-center mb-2 px-2">
                <p class="text-[10px] font-black text-slate-500 uppercase">Resultado Oficial: ${winnerNumbers.join(' ')}</p>
            </div>
    `;

    gamesRaw.forEach((line) => {
        const nums = line.split(/[\s,.-]+/).map(n => parseInt(n)).filter(n => n >= 1 && n <= 25);
        if (nums.length < 15) return;

        const hits = nums.filter(n => winnerNumbers.includes(n)).length;
        const isWinner = hits >= 11;

        html += `
            <div class="glass-card p-4 rounded-2xl flex items-center justify-between border-l-4 ${isWinner ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-white/5'}">
                <div class="flex flex-wrap gap-1.5">
                    ${nums.map(n => {
            const hit = winnerNumbers.includes(n);
            return `<div class="w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black 
                            ${hit ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/5 text-slate-500 border border-white/5'}">
                            ${String(n).padStart(2, '0')}
                        </div>`;
        }).join('')}
                </div>
                <div class="text-right ml-4">
                    <p class="text-[9px] text-slate-500 font-bold uppercase">Acertos</p>
                    <p class="text-xl font-black ${hits >= 13 ? 'text-emerald-400' : hits >= 11 ? 'text-white' : 'text-slate-600'}">${hits}</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    if (resultsArea) resultsArea.innerHTML = html;
};
