// ANALYTICS & CHARTS MODULE
let bubbleChartInst = null;
let sumTrendInst = null;
let parityTrendInst = null;

function initAnalyticsPlus() {
    if (!dashboardData) return;
    const res = dashboardData;

    // Render Triplets
    const tripContainer = document.getElementById('triplets-list');
    if (tripContainer && res.triplets) {
        tripContainer.innerHTML = res.triplets.map(t => `
            <div class="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition">
                <div class="flex gap-2">
                    ${t.dezenas.map(n => `<span class="text-sm font-black text-white">${String(n).padStart(2, '0')}</span>`).join(' ')}
                </div>
                <span class="text-[10px] font-black text-pink-400 group-hover:scale-110 transition">${t.count}x</span>
            </div>
        `).join('');
    }

    // Bubble Chart
    const ctx = document.getElementById('bubbleChart');
    if (ctx) {
        if (bubbleChartInst) bubbleChartInst.destroy();
        const bubbleData = Array.from({ length: 25 }, (_, i) => i + 1).map(n => ({
            x: res.frequencia_total[n] || 0,
            y: res.recurrence[n] || 0,
            r: Math.max(5, (res.frequencia_10[n] || 0) * 3),
            label: String(n).padStart(2, '0')
        }));

        bubbleChartInst = new Chart(ctx.getContext('2d'), {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Dezenas',
                    data: bubbleData,
                    backgroundColor: 'rgba(139, 92, 246, 0.4)',
                    borderColor: '#A78BFA',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Frequência Total', color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { title: { display: true, text: 'Recorrência Média', color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Dezena ${ctx.raw.label}: Freq ${ctx.raw.x}, Rec ${ctx.raw.y}`
                        }
                    }
                }
            }
        });
    }
}

function initTrendCharts() {
    if (!dashboardData || !dashboardData.history) return;
    const history = [...dashboardData.history].slice(0, 50).reverse();
    const labels = history.map((_, i) => i + 1);

    // Sum Chart
    const sums = history.map(draw => draw.reduce((a, b) => a + b, 0));
    const sumCanvas = document.getElementById('sumTrendChart');
    if (sumCanvas) {
        const sumCtx = sumCanvas.getContext('2d');
        if (sumTrendInst) sumTrendInst.destroy();
        sumTrendInst = new Chart(sumCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Soma Total',
                    data: sums,
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 140, max: 240,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94A3B8' }
                    },
                    x: { display: false }
                }
            }
        });
    }

    // Parity Chart
    const pares = history.map(draw => draw.filter(n => n % 2 === 0).length);
    const parityCanvas = document.getElementById('parityTrendChart');
    if (parityCanvas) {
        const parityCtx = parityCanvas.getContext('2d');
        if (parityTrendInst) parityTrendInst.destroy();
        parityTrendInst = new Chart(parityCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Qtd Pares',
                    data: pares,
                    borderColor: '#D946EF',
                    backgroundColor: 'rgba(217, 70, 239, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0, max: 15,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94A3B8' }
                    },
                    x: { display: false }
                }
            }
        });
    }
}
