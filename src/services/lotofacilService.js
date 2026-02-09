// src/services/lotofacilService.js

const API_BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil';

export async function buscarUltimoConcurso() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Erro ao buscar resultado');
        const data = await response.json();
        return formatarResultado(data);
    } catch (error) {
        console.error('Erro ao buscar último concurso:', error);
        throw error;
    }
}

export async function buscarConcurso(numero) {
    try {
        const response = await fetch(`${API_BASE_URL}/${numero}`);
        if (!response.ok) throw new Error('Erro ao buscar concurso');
        const data = await response.json();
        return formatarResultado(data);
    } catch (error) {
        console.error(`Erro ao buscar concurso ${numero}:`, error);
        throw error;
    }
}

export async function buscarHistorico(quantidade = 10) {
    try {
        const ultimo = await buscarUltimoConcurso();
        const numeroConcurso = ultimo.numero;
        const promessas = [];
        for (let i = 0; i < quantidade - 1; i++) {
            const num = numeroConcurso - i - 1;
            if (num > 0) promessas.push(buscarConcurso(num));
        }
        const anteriores = await Promise.all(promessas);
        return [ultimo, ...anteriores].sort((a, b) => b.numero - a.numero);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        throw error;
    }
}

function formatarResultado(data) {
    return {
        numero: data.numero || 0,
        data: data.dataApuracao || '',
        numeros: extrairNumerosSorteados(data),
        premios: {
            acertos15: {
                ganhadores: data.listaRateioPremio?.find(p => p.faixa === 1)?.numeroDeGanhadores || 0,
                valorPremio: data.listaRateioPremio?.find(p => p.faixa === 1)?.valorPremio || 0,
            },
            acertos14: {
                ganhadores: data.listaRateioPremio?.find(p => p.faixa === 2)?.numeroDeGanhadores || 0,
                valorPremio: data.listaRateioPremio?.find(p => p.faixa === 2)?.valorPremio || 0,
            },
            acertos13: {
                ganhadores: data.listaRateioPremio?.find(p => p.faixa === 3)?.numeroDeGanhadores || 0,
                valorPremio: data.listaRateioPremio?.find(p => p.faixa === 3)?.valorPremio || 0,
            },
            acertos12: {
                ganhadores: data.listaRateioPremio?.find(p => p.faixa === 4)?.numeroDeGanhadores || 0,
                valorPremio: data.listaRateioPremio?.find(p => p.faixa === 4)?.valorPremio || 0,
            },
            acertos11: {
                ganhadores: data.listaRateioPremio?.find(p => p.faixa === 5)?.numeroDeGanhadores || 0,
                valorPremio: data.listaRateioPremio?.find(p => p.faixa === 5)?.valorPremio || 0,
            },
        },
        valorArrecadado: data.valorArrecadado || 0,
        valorAcumulado: data.valorAcumuladoConcurso_0_5 || 0,
        proximoConcurso: {
            numero: data.numeroConcursoProximo || 0,
            data: data.dataProximoConcurso || '',
            valorEstimado: data.valorEstimadoProximoConcurso || 0,
        },
    };
}

function extrairNumerosSorteados(data) {
    if (data.listaDezenas && Array.isArray(data.listaDezenas)) {
        return data.listaDezenas.map(n => parseInt(n)).sort((a, b) => a - b);
    }
    const numeros = [];
    for (let i = 1; i <= 15; i++) {
        const campo = `dezena${i}`;
        if (data[campo]) numeros.push(parseInt(data[campo]));
    }
    return numeros.sort((a, b) => a - b);
}

export function conferirJogo(numerosJogo, numerosResultado) {
    const acertos = numerosJogo.filter(n => numerosResultado.includes(n));
    return {
        quantidade: acertos.length,
        numeros: acertos,
        premiado: acertos.length >= 11,
    };
}

export function formatarValor(valor) {
    if (!valor || valor === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

export function formatarData(dataString) {
    if (!dataString) return '';

    // Se já estiver no formato brasileiro DD/MM/YYYY, apenas retorna
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
        return dataString;
    }

    // Tenta tratar formatos comuns ou ISO
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) {
            // Se falhou, pode ser que a string veio em algum formato estranho
            return dataString;
        }
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        return dataString;
    }
}

export function calcularFrequencias(historico) {
    const frequencias = {};
    // Inicializa todos os números (01 a 25) com zero
    for (let i = 1; i <= 25; i++) {
        frequencias[i] = 0;
    }

    // Conta as ocorrências
    historico.forEach(concurso => {
        if (concurso.numeros) {
            concurso.numeros.forEach(num => {
                frequencias[num] = (frequencias[num] || 0) + 1;
            });
        }
    });

    // Converte para um formato fácil de usar no gráfico
    return Object.keys(frequencias).map(num => ({
        numero: num.toString().padStart(2, '0'),
        quantidade: frequencias[num]
    })).sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
}