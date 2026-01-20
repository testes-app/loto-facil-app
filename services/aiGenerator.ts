import { obterEstatisticasAtrasos, obterFrequenciaDezenas } from '../database/operations';

export type AIStrategy = 'random' | 'most_frequent' | 'most_delayed' | 'balanced';

/**
 * Gera um jogo de Lotofácil baseado na estratégia selecionada.
 */
export const gerarJogoIA = async (strategy: AIStrategy, qtdeDezenas: number = 15): Promise<number[]> => {
    try {
        let numeros: Set<number> = new Set();
        const todasDezenas = Array.from({ length: 25 }, (_, i) => i + 1);

        if (strategy === 'random') {
            while (numeros.size < qtdeDezenas) {
                const r = Math.floor(Math.random() * 25) + 1;
                numeros.add(r);
            }
        }

        else if (strategy === 'most_frequent') {
            // Pega os 100 últimos
            const stats = await obterFrequenciaDezenas(100);
            if (stats && stats.frequencias.length > 0) {
                // Seleciona top 60% das dezenas desejadas dos mais frequentes
                const topCount = Math.floor(qtdeDezenas * 0.6);
                const tops = stats.frequencias.slice(0, 10).map(f => f.numero); // Top 10 mais quentes

                // Adiciona aleatórios desses tops
                while (numeros.size < topCount && tops.length > 0) {
                    const idx = Math.floor(Math.random() * tops.length);
                    numeros.add(tops[idx]);
                }
            }
            // Completa com aleatórios do resto
            while (numeros.size < qtdeDezenas) {
                const r = Math.floor(Math.random() * 25) + 1;
                numeros.add(r);
            }
        }

        else if (strategy === 'most_delayed') {
            const stats = await obterEstatisticasAtrasos();
            if (stats && stats.data.length > 0) {
                // Pega os 10 mais atrasados
                const atrasados = stats.data.slice(0, 10).map(d => d.numero);
                const priorityCount = Math.floor(qtdeDezenas * 0.5); // 50% prioridade para atrasados

                for (let i = 0; i < Math.min(priorityCount, atrasados.length); i++) {
                    numeros.add(atrasados[i]);
                }
            }
            // Completa aleatório
            while (numeros.size < qtdeDezenas) {
                const r = Math.floor(Math.random() * 25) + 1;
                numeros.add(r);
            }
        }

        else if (strategy === 'balanced') {
            // Tenta equilibrar Pares e Ímpares (aprox metade/metade)
            const pares = todasDezenas.filter(n => n % 2 === 0);
            const impares = todasDezenas.filter(n => n % 2 !== 0);

            const targetPares = Math.floor(qtdeDezenas / 2);
            // O resto ímpares

            while (numeros.size < targetPares) {
                const r = pares[Math.floor(Math.random() * pares.length)];
                numeros.add(r);
            }

            while (numeros.size < qtdeDezenas) {
                const r = impares[Math.floor(Math.random() * impares.length)];
                numeros.add(r);
            }
        }

        return Array.from(numeros).sort((a, b) => a - b);
    } catch (error) {
        console.error('Erro ao gerar jogo IA:', error);
        // Fallback para random se der erro no banco
        const fallback: number[] = [];
        while (fallback.length < qtdeDezenas) {
            const r = Math.floor(Math.random() * 25) + 1;
            if (!fallback.includes(r)) fallback.push(r);
        }
        return fallback.sort((a, b) => a - b);
    }
};
