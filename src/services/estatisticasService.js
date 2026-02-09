class EstatisticasService {
    calcularEstatisticas(resultados, ultimosN = 10) {
        if (!resultados || resultados.length === 0) {
            return this.getEstatisticasPadrao();
        }

        const frequencia = this.calcularFrequencia(resultados, ultimosN);
        const paresImpares = this.analisarParesImpares(resultados, ultimosN);
        const distribuicao = this.analisarDistribuicao(resultados, ultimosN);

        return {
            frequencia,
            paresImpares,
            distribuicao,
            totalConcursos: resultados.length,
            ultimoConcurso: resultados[0]?.numero || 0,
            concursosAnalizados: Math.min(ultimosN, resultados.length)
        };
    }

    calcularFrequencia(resultados, ultimosN) {
        const frequencia = {};
        const recentes = resultados.slice(0, ultimosN);

        // Inicializa
        for (let i = 1; i <= 25; i++) {
            frequencia[i] = 0;
        }

        // Conta
        recentes.forEach(res => {
            if (res.numeros) {
                res.numeros.forEach(num => {
                    frequencia[parseInt(num)]++;
                });
            }
        });

        const totalAnalizados = recentes.length || 1;

        return Object.entries(frequencia)
            .map(([numero, ocorrencias]) => ({
                numero: parseInt(numero),
                numeroFormatado: numero.toString().padStart(2, '0'),
                ocorrencias,
                percentual: (ocorrencias / totalAnalizados) * 100,
                status: this.getStatusFrequencia(ocorrencias, totalAnalizados),
            }))
            .sort((a, b) => b.ocorrencias - a.ocorrencias);
    }

    getStatusFrequencia(ocorrencias, total) {
        const percentual = (ocorrencias / total) * 100;
        if (percentual >= 70) return 'hot';      // 🔥 Muito quente
        if (percentual >= 50) return 'warm';     // 🟠 Quente
        if (percentual >= 30) return 'neutral';  // 🟣 Neutro
        if (percentual >= 15) return 'cool';     // 🔵 Frio
        return 'cold';                           // 🧊 Muito frio
    }

    analisarParesImpares(resultados, ultimosN) {
        const recentes = resultados.slice(0, ultimosN);
        let totalPares = 0;
        let totalImpares = 0;

        recentes.forEach(res => {
            if (res.numeros) {
                const pares = res.numeros.filter(n => parseInt(n) % 2 === 0).length;
                totalPares += pares;
                totalImpares += (res.numeros.length - pares);
            }
        });

        const total = (totalPares + totalImpares) || 1;

        return {
            pares: {
                media: (totalPares / (recentes.length || 1)).toFixed(1),
                percentual: ((totalPares / total) * 100).toFixed(1),
            },
            impares: {
                media: (totalImpares / (recentes.length || 1)).toFixed(1),
                percentual: ((totalImpares / total) * 100).toFixed(1),
            },
        };
    }

    analisarDistribuicao(resultados, ultimosN) {
        const recentes = resultados.slice(0, ultimosN);
        let baixos = 0; // 1-8
        let medios = 0; // 9-17
        let altos = 0;  // 18-25

        recentes.forEach(res => {
            if (res.numeros) {
                res.numeros.forEach(n => {
                    const num = parseInt(n);
                    if (num <= 8) baixos++;
                    else if (num <= 17) medios++;
                    else altos++;
                });
            }
        });

        const total = (baixos + medios + altos) || 1;

        return {
            baixos: { media: (baixos / (recentes.length || 1)).toFixed(1), percentual: ((baixos / total) * 100).toFixed(1) },
            medios: { media: (medios / (recentes.length || 1)).toFixed(1), percentual: ((medios / total) * 100).toFixed(1) },
            altos: { media: (altos / (recentes.length || 1)).toFixed(1), percentual: ((altos / total) * 100).toFixed(1) },
        };
    }

    getEstatisticasPadrao() {
        return {
            frequencia: Array.from({ length: 25 }, (_, i) => ({
                numero: i + 1,
                numeroFormatado: (i + 1).toString().padStart(2, '0'),
                ocorrencias: 0,
                percentual: 0,
                status: 'neutral'
            })),
            paresImpares: {
                pares: { media: '0', percentual: '0' },
                impares: { media: '0', percentual: '0' },
            },
            distribuicao: {
                baixos: { media: '0', percentual: '0' },
                medios: { media: '0', percentual: '0' },
                altos: { media: '0', percentual: '0' },
            },
            totalConcursos: 0,
            ultimoConcurso: 0,
            concursosAnalizados: 0
        };
    }
}

export default new EstatisticasService();
