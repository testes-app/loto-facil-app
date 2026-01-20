// Utilitário para detectar padrões geométricos no volante da Lotofácil
// Volante: 5 colunas x 5 linhas (1-25)

export type PadraoDetectado = {
    tipo: 'nenhum' | 'linha_horizontal' | 'linha_vertical' | 'diagonal' | 'bordas' | 'cruz' | 'losango';
    descricao: string;
    severidade: 'baixa' | 'media' | 'alta'; // Quão "óbvio" é o padrão
};

// Converte número (1-25) para coordenadas [linha, coluna]
const numParaCoord = (num: number): [number, number] => {
    const linha = Math.floor((num - 1) / 5);
    const coluna = (num - 1) % 5;
    return [linha, coluna];
};

// Verifica se há linha horizontal completa ou quase completa
const verificarLinhaHorizontal = (numeros: number[]): PadraoDetectado | null => {
    const coords = numeros.map(numParaCoord);

    for (let linha = 0; linha < 5; linha++) {
        const nessaLinha = coords.filter(([l]) => l === linha).length;

        if (nessaLinha === 5) {
            return {
                tipo: 'linha_horizontal',
                descricao: `Linha ${linha + 1} completa`,
                severidade: 'alta'
            };
        }

        if (nessaLinha >= 4) {
            return {
                tipo: 'linha_horizontal',
                descricao: `${nessaLinha} números na Linha ${linha + 1}`,
                severidade: 'media'
            };
        }
    }

    return null;
};

// Verifica se há coluna vertical completa ou quase completa
const verificarLinhaVertical = (numeros: number[]): PadraoDetectado | null => {
    const coords = numeros.map(numParaCoord);

    for (let coluna = 0; coluna < 5; coluna++) {
        const nessaColuna = coords.filter(([, c]) => c === coluna).length;

        if (nessaColuna === 5) {
            return {
                tipo: 'linha_vertical',
                descricao: `Coluna ${coluna + 1} completa`,
                severidade: 'alta'
            };
        }

        if (nessaColuna >= 4) {
            return {
                tipo: 'linha_vertical',
                descricao: `${nessaColuna} números na Coluna ${coluna + 1}`,
                severidade: 'media'
            };
        }
    }

    return null;
};

// Verifica diagonal principal (1, 7, 13, 19, 25) ou secundária (5, 9, 13, 17, 21)
const verificarDiagonal = (numeros: number[]): PadraoDetectado | null => {
    const principal = [1, 7, 13, 19, 25];
    const secundaria = [5, 9, 13, 17, 21];

    const acertosPrincipal = numeros.filter(n => principal.includes(n)).length;
    const acertosSecundaria = numeros.filter(n => secundaria.includes(n)).length;

    if (acertosPrincipal >= 4) {
        return {
            tipo: 'diagonal',
            descricao: `Diagonal principal (${acertosPrincipal}/5)`,
            severidade: acertosPrincipal === 5 ? 'alta' : 'media'
        };
    }

    if (acertosSecundaria >= 4) {
        return {
            tipo: 'diagonal',
            descricao: `Diagonal secundária (${acertosSecundaria}/5)`,
            severidade: acertosSecundaria === 5 ? 'alta' : 'media'
        };
    }

    return null;
};

// Verifica se a maioria está nas bordas
const verificarBordas = (numeros: number[]): PadraoDetectado | null => {
    const bordas = [
        1, 2, 3, 4, 5,      // Linha superior
        6, 10,              // Laterais
        11, 15,
        16, 20,
        21, 22, 23, 24, 25  // Linha inferior
    ];

    const nasBordas = numeros.filter(n => bordas.includes(n)).length;

    if (nasBordas >= 12) {
        return {
            tipo: 'bordas',
            descricao: `${nasBordas} números nas bordas`,
            severidade: 'media'
        };
    }

    return null;
};

// Função principal que detecta qualquer padrão
export const detectarPadrao = (numeros: number[]): PadraoDetectado => {
    if (numeros.length < 15) {
        return {
            tipo: 'nenhum',
            descricao: 'Distribuição natural',
            severidade: 'baixa'
        };
    }

    // Verifica padrões em ordem de prioridade
    const padroes = [
        verificarLinhaHorizontal(numeros),
        verificarLinhaVertical(numeros),
        verificarDiagonal(numeros),
        verificarBordas(numeros)
    ];

    // Retorna o primeiro padrão encontrado (mais severo)
    for (const padrao of padroes) {
        if (padrao) return padrao;
    }

    return {
        tipo: 'nenhum',
        descricao: 'Distribuição natural',
        severidade: 'baixa'
    };
};
