// LOTOMATRIX DIAGNOSTIC SYSTEM
(function () {
    const CRITICAL_IDS = [
        'loading-overlay', 'view-dashboard', 'sidebar-item',
        'last-contest-id', 'last-numbers', 'heatmap-grid',
        'hot-count', 'delay-count', 'suggestion-balls',
        'sim-results', 'sim-stats-grid', 'sim-selector'
    ];

    window.runDiagnostic = function () {
        console.log("🔍 Iniciando Diagnóstico LotoMatrix Code Guard...");
        let errors = 0;

        CRITICAL_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (!el) {
                // Algumas classes como sidebar-item são buscadas por classe no boot
                if (id === 'sidebar-item') {
                    if (document.querySelectorAll('.sidebar-item').length === 0) {
                        console.error(`❌ ERRO CRÍTICO: Nenhum elemento com classe '.sidebar-item' encontrado.`);
                        errors++;
                    }
                } else {
                    console.error(`❌ ERRO CRÍTICO: Elemento ID '${id}' não encontrado no HTML.`);
                    errors++;
                }
            }
        });

        if (errors === 0) {
            console.log("✅ Sistema Íntegro: 0 erros detectados.");
        } else {
            console.warn(`⚠️ Diagnóstico concluído com ${errors} erros. Verifique o HTML.`);
            if (window.showToast) showToast(`Hardware: ${errors} falhas detectadas no HTML`, "error");
        }
    };

    // Auto-run on boot
    window.addEventListener('load', () => {
        setTimeout(window.runDiagnostic, 2000); // Aguarda renderização inicial
    });
})();
