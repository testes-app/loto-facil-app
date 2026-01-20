/**
 * 🎯 SCORE DE VIABILIDADE - Lotofácil Premium
 * 
 * Analisa jogos e atribui uma pontuação baseada em critérios estatísticos
 * derivados de análise dos 3000+ concursos históricos.
 */

// ============================================
// INTERFACES E TIPOS
// ============================================

export interface ScoreDetalhado {
    scoreGeral: number;
    status: 'excelente' | 'bom' | 'atencao' | 'ruim';
    detalhes: {
        parImpar: { score: number; descricao: string };
        soma: { score: number; descricao: string };
        primos: { score: number; descricao: string };
        distribuicao: { score: number; descricao: string };
        sequencias: { score: number; descricao: string };
        bordas: { score: number; descricao: string };
    };
}

// ============================================
// CONSTANTES BASEADAS EM DADOS HISTÓRICOS
// ============================================

const CRITERIOS = {
    // Distribuição Par/Ímpar (25% do peso)
    PAR_IMPAR: {
        peso: 0.25,
        ideal: [7, 8],      // 7 ou 8 pares é o mais comum
        aceitavel: [6, 9],  // 6 ou 9 ainda é bom
        ruim: [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15]
    },

    // Soma dos números (25% do peso)
    SOMA: {
        peso: 0.25,
        ideal: { min: 180, max: 230 },      // Faixa mais comum
        aceitavel: { min: 160, max: 250 },  // Ainda aceitável
        ruim: { min: 0, max: 375 }          // Extremos raros
    },

    // Números Primos (15% do peso)
    PRIMOS: {
        peso: 0.15,
        ideal: [5, 6, 7],   // Quantidade ideal de primos
        aceitavel: [4, 8],  // Aceitável
        lista: [2, 3, 5, 7, 11, 13, 17, 19, 23] // Primos de 1-25
    },

    // Distribuição Espacial (15% do peso)
    DISTRIBUICAO: {
        peso: 0.15,
        // Idealmente números espalhados pela cartela
    },

    // Sequências (10% do peso)
    SEQUENCIAS: {
        peso: 0.10,
        maxIdeal: 4,      // Até 4 números seguidos é normal
        maxAceitavel: 6,  // Até 6 ainda ok
        problematico: 7   // 7+ é muito raro
    },

    // Bordas da Cartela (10% do peso)
    BORDAS: {
        peso: 0.10,
        ideal: { min: 3, max: 6 }, // Números nas bordas
        bordaSuperior: [1, 2, 3, 4, 5],
        bordaInferior: [21, 22, 23, 24, 25],
        bordaEsquerda: [1, 6, 11, 16, 21],
        bordaDireita: [5, 10, 15, 20, 25]
    }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function calcularScoreParImpar(numeros: number[]): { score: number; descricao: string } {
    const pares = numeros.filter(n => n % 2 === 0).length;

    if (CRITERIOS.PAR_IMPAR.ideal.includes(pares)) {
        return { score: 10, descricao: `${pares} pares - Distribuição ideal!` };
    }

    if (CRITERIOS.PAR_IMPAR.aceitavel.includes(pares)) {
        return { score: 7, descricao: `${pares} pares - Boa distribuição` };
    }

    if (pares <= 5 || pares >= 10) {
        return { score: 3, descricao: `${pares} pares - Muito desequilibrado` };
    }

    return { score: 5, descricao: `${pares} pares - Distribuição média` };
}

function calcularScoreSoma(numeros: number[]): { score: number; descricao: string } {
    const soma = numeros.reduce((acc, n) => acc + n, 0);
    const { ideal, aceitavel } = CRITERIOS.SOMA;

    if (soma >= ideal.min && soma <= ideal.max) {
        return { score: 10, descricao: `Soma ${soma} - Faixa ideal!` };
    }

    if (soma >= aceitavel.min && soma <= aceitavel.max) {
        return { score: 7, descricao: `Soma ${soma} - Faixa aceitável` };
    }

    if (soma < 140 || soma > 270) {
        return { score: 2, descricao: `Soma ${soma} - Extremo raro` };
    }

    return { score: 5, descricao: `Soma ${soma} - Faixa média` };
}

function calcularScorePrimos(numeros: number[]): { score: number; descricao: string } {
    const primos = numeros.filter(n => CRITERIOS.PRIMOS.lista.includes(n)).length;

    if (CRITERIOS.PRIMOS.ideal.includes(primos)) {
        return { score: 10, descricao: `${primos} primos - Quantidade ideal!` };
    }

    if (CRITERIOS.PRIMOS.aceitavel.includes(primos)) {
        return { score: 7, descricao: `${primos} primos - Boa quantidade` };
    }

    if (primos <= 2 || primos >= 9) {
        return { score: 3, descricao: `${primos} primos - Quantidade rara` };
    }

    return { score: 5, descricao: `${primos} primos - Quantidade média` };
}

function calcularScoreDistribuicao(numeros: number[]): { score: number; descricao: string } {
    // Divide a cartela em 5 faixas (1-5, 6-10, 11-15, 16-20, 21-25)
    const faixas = [0, 0, 0, 0, 0];

    numeros.forEach(n => {
        const faixa = Math.floor((n - 1) / 5);
        faixas[faixa]++;
    });

    const faixasVazias = faixas.filter(f => f === 0).length;
    const faixasMuitoCheias = faixas.filter(f => f >= 6).length;

    if (faixasVazias === 0 && faixasMuitoCheias === 0) {
        return { score: 10, descricao: 'Distribuição perfeita!' };
    }

    if (faixasVazias <= 1 && faixasMuitoCheias === 0) {
        return { score: 7, descricao: 'Boa distribuição espacial' };
    }

    if (faixasVazias >= 2 || faixasMuitoCheias >= 2) {
        return { score: 3, descricao: 'Distribuição irregular' };
    }

    return { score: 5, descricao: 'Distribuição média' };
}

function calcularScoreSequencias(numeros: number[]): { score: number; descricao: string } {
    const ordenados = [...numeros].sort((a, b) => a - b);
    let maiorSequencia = 1;
    let sequenciaAtual = 1;

    for (let i = 1; i < ordenados.length; i++) {
        if (ordenados[i] === ordenados[i - 1] + 1) {
            sequenciaAtual++;
            maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);
        } else {
            sequenciaAtual = 1;
        }
    }

    if (maiorSequencia <= CRITERIOS.SEQUENCIAS.maxIdeal) {
        return { score: 10, descricao: `Sequência máx: ${maiorSequencia} - Ótimo!` };
    }

    if (maiorSequencia <= CRITERIOS.SEQUENCIAS.maxAceitavel) {
        return { score: 6, descricao: `Sequência máx: ${maiorSequencia} - Aceitável` };
    }

    return { score: 2, descricao: `Sequência de ${maiorSequencia} - Muito raro!` };
}

function calcularScoreBordas(numeros: number[]): { score: number; descricao: string } {
    const { bordaSuperior, bordaInferior, bordaEsquerda, bordaDireita } = CRITERIOS.BORDAS;

    const totalBordas = [
        ...numeros.filter(n => bordaSuperior.includes(n)),
        ...numeros.filter(n => bordaInferior.includes(n)),
        ...numeros.filter(n => bordaEsquerda.includes(n)),
        ...numeros.filter(n => bordaDireita.includes(n))
    ].filter((n, i, arr) => arr.indexOf(n) === i).length; // Remove duplicados

    const { ideal } = CRITERIOS.BORDAS;

    if (totalBordas >= ideal.min && totalBordas <= ideal.max) {
        return { score: 10, descricao: `${totalBordas} nas bordas - Ideal!` };
    }

    if (totalBordas >= 2 && totalBordas <= 8) {
        return { score: 7, descricao: `${totalBordas} nas bordas - Bom` };
    }

    if (totalBordas === 0 || totalBordas >= 12) {
        return { score: 3, descricao: `${totalBordas} nas bordas - Raro` };
    }

    return { score: 5, descricao: `${totalBordas} nas bordas - Médio` };
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

export function calcularScoreJogo(numeros: number[]): ScoreDetalhado {
    if (numeros.length < 15 || numeros.length > 20) {
        throw new Error('O jogo deve ter entre 15 e 20 números');
    }

    // Calcula cada critério
    const parImpar = calcularScoreParImpar(numeros);
    const soma = calcularScoreSoma(numeros);
    const primos = calcularScorePrimos(numeros);
    const distribuicao = calcularScoreDistribuicao(numeros);
    const sequencias = calcularScoreSequencias(numeros);
    const bordas = calcularScoreBordas(numeros);

    // Calcula score geral ponderado
    const scoreGeral = (
        parImpar.score * CRITERIOS.PAR_IMPAR.peso +
        soma.score * CRITERIOS.SOMA.peso +
        primos.score * CRITERIOS.PRIMOS.peso +
        distribuicao.score * CRITERIOS.DISTRIBUICAO.peso +
        sequencias.score * CRITERIOS.SEQUENCIAS.peso +
        bordas.score * CRITERIOS.BORDAS.peso
    );

    // Define status
    let status: 'excelente' | 'bom' | 'atencao' | 'ruim';
    if (scoreGeral >= 8.5) status = 'excelente';
    else if (scoreGeral >= 7.0) status = 'bom';
    else if (scoreGeral >= 5.0) status = 'atencao';
    else status = 'ruim';

    return {
        scoreGeral,
        status,
        detalhes: {
            parImpar,
            soma,
            primos,
            distribuicao,
            sequencias,
            bordas
        }
    };
}

// ============================================
// FUNÇÃO DE TESTE (OPCIONAL)
// ============================================

export function testarScore() {
    const jogoTeste = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 24, 25, 2];
    const resultado = calcularScoreJogo(jogoTeste);

    console.log('🎯 TESTE DO SCORE');
    console.log('Jogo:', jogoTeste.join(', '));
    console.log('Score Geral:', resultado.scoreGeral.toFixed(2));
    console.log('Status:', resultado.status);
    console.log('\n📊 Detalhes:');
    console.log('Par/Ímpar:', resultado.detalhes.parImpar);
    console.log('Soma:', resultado.detalhes.soma);
    console.log('Primos:', resultado.detalhes.primos);
    console.log('Distribuição:', resultado.detalhes.distribuicao);
    console.log('Sequências:', resultado.detalhes.sequencias);
    console.log('Bordas:', resultado.detalhes.bordas);

    return resultado;
}