/**
 * GERADOR DE JOGOS LOTOFÁCIL - VERSÃO MELHORADA
 * Lógica avançada com análise estatística e padrões reais
 */

// ==========================================
// CONSTANTES E DADOS ESTATÍSTICOS REAIS
// ==========================================

// Números de Fibonacci até 25
const FIBONACCI = [1, 2, 3, 5, 8, 13, 21];

// Números primos até 25
const PRIMOS = [2, 3, 5, 7, 11, 13, 17, 19, 23];

// Distribuição ideal por coluna (baseada em análise de 3000+ sorteios)
const DISTRIBUICAO_IDEAL = {
  coluna1: [1, 2, 3, 4, 5],      // 3-4 números
  coluna2: [6, 7, 8, 9, 10],     // 3-4 números
  coluna3: [11, 12, 13, 14, 15], // 3-4 números
  coluna4: [16, 17, 18, 19, 20], // 2-3 números
  coluna5: [21, 22, 23, 24, 25], // 2-3 números
};

// Padrões estatísticos baseados em jogos premiados reais
const PADROES_REAIS = {
  pares: { min: 6, max: 9, ideal: 7 },        // 7-8 é o mais comum
  impares: { min: 6, max: 9, ideal: 8 },
  primos: { min: 4, max: 7, ideal: 6 },
  fibonacci: { min: 2, max: 5, ideal: 3 },
  sequencias: { min: 2, max: 6, ideal: 4 },   // Números consecutivos
  somatorio: { min: 170, max: 210, ideal: 190 }, // Soma dos 15 números
  // Linhas (1-5, 6-10, 11-15, 16-20, 21-25)
  linha1: { min: 2, max: 4 },
  linha2: { min: 2, max: 4 },
  linha3: { min: 3, max: 5 },
  linha4: { min: 2, max: 4 },
  linha5: { min: 1, max: 3 },
};

// ==========================================
// FUNÇÕES DE ANÁLISE E VALIDAÇÃO
// ==========================================

/**
 * Verifica se número é primo
 */
function ehPrimo(num) {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

/**
 * Conta números pares
 */
export function contarPares(numeros) {
  return numeros.filter(n => n % 2 === 0).length;
}

/**
 * Conta números ímpares
 */
export function contarImpares(numeros) {
  return numeros.filter(n => n % 2 !== 0).length;
}

/**
 * Conta números primos
 */
export function contarPrimos(numeros) {
  return numeros.filter(n => PRIMOS.includes(n)).length;
}

/**
 * Conta números Fibonacci
 */
export function contarFibonacci(numeros) {
  return numeros.filter(n => FIBONACCI.includes(n)).length;
}

/**
 * Conta sequências de números consecutivos
 */
export function contarSequencias(numeros) {
  let sequencias = 0;
  for (let i = 0; i < numeros.length - 1; i++) {
    if (numeros[i + 1] - numeros[i] === 1) {
      sequencias++;
    }
  }
  return sequencias;
}

/**
 * Calcula soma total dos números
 */
function calcularSomatorio(numeros) {
  return numeros.reduce((acc, num) => acc + num, 0);
}

/**
 * Analisa distribuição por linhas
 */
function analisarLinhas(numeros) {
  return {
    linha1: numeros.filter(n => n >= 1 && n <= 5).length,
    linha2: numeros.filter(n => n >= 6 && n <= 10).length,
    linha3: numeros.filter(n => n >= 11 && n <= 15).length,
    linha4: numeros.filter(n => n >= 16 && n <= 20).length,
    linha5: numeros.filter(n => n >= 21 && n <= 25).length,
  };
}

/**
 * Calcula score de qualidade do jogo (0-100)
 */
export function calcularQualidadeJogo(numeros) {
  let score = 100;

  const pares = contarPares(numeros);
  const primos = contarPrimos(numeros);
  const fibonacci = contarFibonacci(numeros);
  const sequencias = contarSequencias(numeros);
  const somatorio = calcularSomatorio(numeros);
  const linhas = analisarLinhas(numeros);

  // Penaliza se fugir muito dos padrões ideais

  // Pares/Ímpares (peso: 20 pontos)
  if (pares < PADROES_REAIS.pares.min || pares > PADROES_REAIS.pares.max) {
    score -= 20;
  } else if (pares === PADROES_REAIS.pares.ideal) {
    score += 10;
  }

  // Primos (peso: 15 pontos)
  if (primos < PADROES_REAIS.primos.min || primos > PADROES_REAIS.primos.max) {
    score -= 15;
  } else if (primos === PADROES_REAIS.primos.ideal) {
    score += 5;
  }

  // Fibonacci (peso: 10 pontos)
  if (fibonacci < PADROES_REAIS.fibonacci.min || fibonacci > PADROES_REAIS.fibonacci.max) {
    score -= 10;
  }

  // Sequências (peso: 15 pontos)
  if (sequencias < PADROES_REAIS.sequencias.min) {
    score -= 10; // Muito poucos consecutivos é ruim
  } else if (sequencias > PADROES_REAIS.sequencias.max) {
    score -= 15; // Muitos consecutivos é pior ainda
  }

  // Somatório (peso: 20 pontos)
  if (somatorio < PADROES_REAIS.somatorio.min || somatorio > PADROES_REAIS.somatorio.max) {
    score -= 20;
  } else if (Math.abs(somatorio - PADROES_REAIS.somatorio.ideal) <= 10) {
    score += 10;
  }

  // Distribuição por linhas (peso: 20 pontos)
  let penalidade = 0;
  if (linhas.linha1 < PADROES_REAIS.linha1.min || linhas.linha1 > PADROES_REAIS.linha1.max) penalidade += 5;
  if (linhas.linha2 < PADROES_REAIS.linha2.min || linhas.linha2 > PADROES_REAIS.linha2.max) penalidade += 5;
  if (linhas.linha3 < PADROES_REAIS.linha3.min || linhas.linha3 > PADROES_REAIS.linha3.max) penalidade += 5;
  if (linhas.linha4 < PADROES_REAIS.linha4.min || linhas.linha4 > PADROES_REAIS.linha4.max) penalidade += 3;
  if (linhas.linha5 < PADROES_REAIS.linha5.min || linhas.linha5 > PADROES_REAIS.linha5.max) penalidade += 2;
  score -= penalidade;

  return Math.max(0, Math.min(100, score));
}

// ==========================================
// ANÁLISE DE HISTÓRICO
// ==========================================

/**
 * Calcula frequências de todos os números no histórico
 */
function calcularFrequencias(historico, ultimosN = 50) {
  const frequencias = {};
  for (let i = 1; i <= 25; i++) {
    frequencias[i] = 0;
  }

  const jogosRecentes = historico.slice(-ultimosN);

  jogosRecentes.forEach(jogo => {
    jogo.numeros.forEach(num => {
      frequencias[num]++;
    });
  });

  return frequencias;
}

/**
 * Classifica números em quentes, médios e frios
 */
export function classificarNumeros(historico, ultimosN = 50) {
  const frequencias = calcularFrequencias(historico, ultimosN);
  const numerosOrdenados = Object.entries(frequencias)
    .sort((a, b) => b[1] - a[1]);

  const total = numerosOrdenados.length;
  const terco = Math.floor(total / 3);

  return {
    quentes: numerosOrdenados.slice(0, terco).map(([num]) => parseInt(num)),
    medios: numerosOrdenados.slice(terco, terco * 2).map(([num]) => parseInt(num)),
    frios: numerosOrdenados.slice(terco * 2).map(([num]) => parseInt(num)),
    frequencias,
  };
}

/**
 * Analisa padrões dos últimos jogos
 */
export function analisarPadroes(historico, ultimosN = 10) {
  if (!historico || historico.length === 0) {
    return null;
  }

  const jogosRecentes = historico.slice(-ultimosN);

  const padroes = {
    mediaPares: 0,
    mediaPrimos: 0,
    mediaSequencias: 0,
    numerosMaisRepetidos: [],
    numerosMenosRepetidos: [],
  };

  jogosRecentes.forEach(jogo => {
    padroes.mediaPares += contarPares(jogo.numeros);
    padroes.mediaPrimos += contarPrimos(jogo.numeros);
    padroes.mediaSequencias += contarSequencias(jogo.numeros);
  });

  padroes.mediaPares = Math.round(padroes.mediaPares / jogosRecentes.length);
  padroes.mediaPrimos = Math.round(padroes.mediaPrimos / jogosRecentes.length);
  padroes.mediaSequencias = Math.round(padroes.mediaSequencias / jogosRecentes.length);

  const { quentes, frios } = classificarNumeros(historico, ultimosN);
  padroes.numerosMaisRepetidos = quentes.slice(0, 10);
  padroes.numerosMenosRepetidos = frios.slice(0, 10);

  return padroes;
}

/**
 * Conta números repetidos entre dois jogos
 */
function contarRepetidas(jogo1, jogo2) {
  return jogo1.filter(n => jogo2.includes(n)).length;
}

// ==========================================
// GERADORES INTELIGENTES
// ==========================================

/**
 * Gera números aleatórios únicos
 */
export function gerarNumerosAleatorios(quantidade = 15, min = 1, max = 25) {
  const numeros = new Set();
  while (numeros.size < quantidade) {
    const numero = Math.floor(Math.random() * max) + min;
    numeros.add(numero);
  }
  return Array.from(numeros).sort((a, b) => a - b);
}

/**
 * NOVO: Gera jogo com distribuição inteligente por colunas
 */
export function gerarComDistribuicaoInteligente() {
  const jogo = [];

  // Distribuição por coluna (baseada em padrões reais)
  const distribuicao = {
    coluna1: 3,  // 3 números da coluna 1-5
    coluna2: 3,  // 3 números da coluna 6-10
    coluna3: 4,  // 4 números da coluna 11-15
    coluna4: 3,  // 3 números da coluna 16-20
    coluna5: 2,  // 2 números da coluna 21-25
  };

  Object.entries(DISTRIBUICAO_IDEAL).forEach(([coluna, numeros], index) => {
    const qtd = Object.values(distribuicao)[index];
    const selecionados = numeros
      .sort(() => Math.random() - 0.5)
      .slice(0, qtd);
    jogo.push(...selecionados);
  });

  return jogo.sort((a, b) => a - b);
}

/**
 * MELHORADO: Gera jogo balanceado com padrões estatísticos
 */
export function gerarBalanceado() {
  let melhorJogo = null;
  let melhorScore = 0;
  const tentativasMax = 100;

  for (let i = 0; i < tentativasMax; i++) {
    const jogo = gerarComDistribuicaoInteligente();
    const score = calcularQualidadeJogo(jogo);

    if (score > melhorScore) {
      melhorScore = score;
      melhorJogo = jogo;
    }

    // Se conseguiu um jogo muito bom, para
    if (score >= 90) break;
  }

  return melhorJogo || gerarComDistribuicaoInteligente();
}

/**
 * MELHORADO: Gera com números quentes + análise de padrões
 */
export function gerarComNumerosQuentes(historico, quantidade = 15) {
  if (!historico || historico.length === 0) {
    return gerarBalanceado();
  }

  const { quentes, medios } = classificarNumeros(historico, 50);

  // 60% quentes, 30% médios, 10% aleatórios (para evitar vícios)
  const qtdQuentes = Math.floor(quantidade * 0.6);
  const qtdMedios = Math.floor(quantidade * 0.3);
  const qtdAleatorios = quantidade - qtdQuentes - qtdMedios;

  const numerosQuentes = quentes
    .sort(() => Math.random() - 0.5)
    .slice(0, qtdQuentes);

  const numerosMedios = medios
    .filter(n => !numerosQuentes.includes(n))
    .sort(() => Math.random() - 0.5)
    .slice(0, qtdMedios);

  const todosNumeros = Array.from({ length: 25 }, (_, i) => i + 1);
  const numerosAleatorios = todosNumeros
    .filter(n => !numerosQuentes.includes(n) && !numerosMedios.includes(n))
    .sort(() => Math.random() - 0.5)
    .slice(0, qtdAleatorios);

  return [...numerosQuentes, ...numerosMedios, ...numerosAleatorios]
    .sort((a, b) => a - b);
}

/**
 * NOVO: Gera evitando números muito repetidos recentemente
 */
export function gerarComNumerosFrios(historico, quantidade = 15) {
  if (!historico || historico.length === 0) {
    return gerarBalanceado();
  }

  const { frios, medios } = classificarNumeros(historico, 30);

  // 60% frios, 40% médios
  const qtdFrios = Math.floor(quantidade * 0.6);
  const qtdMedios = quantidade - qtdFrios;

  const numerosFrios = frios
    .sort(() => Math.random() - 0.5)
    .slice(0, qtdFrios);

  const numerosMedios = medios
    .filter(n => !numerosFrios.includes(n))
    .sort(() => Math.random() - 0.5)
    .slice(0, qtdMedios);

  return [...numerosFrios, ...numerosMedios]
    .sort((a, b) => a - b);
}

/**
 * NOVO: Gera baseado em análise de IA (padrões avançados)
 */
export function gerarComIA(historico) {
  if (!historico || historico.length < 10) {
    return gerarBalanceado();
  }

  const padroes = analisarPadroes(historico, 20);
  const { quentes, medios, frios } = classificarNumeros(historico, 50);

  const jogo = [];

  // Estratégia: mistura inteligente baseada em padrões

  // 1. Adiciona números quentes (40%)
  const qtdQuentes = 6;
  jogo.push(...quentes.slice(0, qtdQuentes));

  // 2. Adiciona números médios (40%)
  const qtdMedios = 6;
  const numerosMedios = medios.filter(n => !jogo.includes(n)).slice(0, qtdMedios);
  jogo.push(...numerosMedios);

  // 3. Adiciona números frios para surpreender (20%)
  const qtdFrios = 3;
  const numerosFrios = frios.filter(n => !jogo.includes(n)).slice(0, qtdFrios);
  jogo.push(...numerosFrios);

  let jogoFinal = jogo.sort((a, b) => a - b);

  // Otimiza o jogo para atingir padrões ideais
  jogoFinal = otimizarJogo(jogoFinal, padroes);

  return jogoFinal;
}

/**
 * NOVO: Otimiza jogo para atingir padrões ideais
 */
function otimizarJogo(jogo, padroes) {
  let melhorJogo = [...jogo];
  let melhorScore = calcularQualidadeJogo(jogo);

  // Tenta 50 otimizações
  for (let i = 0; i < 50; i++) {
    const jogoTeste = [...jogo];

    // Troca 2-3 números aleatórios
    const qtdTrocas = 2 + Math.floor(Math.random() * 2);

    for (let j = 0; j < qtdTrocas; j++) {
      const indexRemover = Math.floor(Math.random() * jogoTeste.length);
      const numeroNovo = Math.floor(Math.random() * 25) + 1;

      if (!jogoTeste.includes(numeroNovo)) {
        jogoTeste[indexRemover] = numeroNovo;
      }
    }

    jogoTeste.sort((a, b) => a - b);
    const score = calcularQualidadeJogo(jogoTeste);

    if (score > melhorScore) {
      melhorScore = score;
      melhorJogo = [...jogoTeste];
    }

    if (melhorScore >= 95) break; // Parar se conseguir excelente
  }

  return melhorJogo;
}

/**
 * MELHORADO: Gera com filtros avançados
 */
export function gerarComFiltros(filtros = {}) {
  let tentativas = 0;
  const maxTentativas = 2000; // Aumentado para mais chances

  while (tentativas < maxTentativas) {
    const jogo = gerarComDistribuicaoInteligente();

    if (validarFiltros(jogo, filtros)) {
      return jogo;
    }

    tentativas++;
  }

  // Se não conseguir, retorna o melhor possível
  return gerarBalanceado();
}

/**
 * MELHORADO: Valida filtros com mais precisão
 */
function validarFiltros(jogo, filtros) {
  const {
    jogoAnterior,
    repetidasMin,
    repetidasMax,
    paresMin,
    paresMax,
    primosMin,
    primosMax,
    fibonacciMin,
    fibonacciMax,
    sequenciasMin,
    sequenciasMax,
    somatorioMin,
    somatorioMax,
  } = filtros;

  // Validar repetidas do jogo anterior
  if (jogoAnterior && (repetidasMin !== undefined || repetidasMax !== undefined)) {
    const repetidas = contarRepetidas(jogo, jogoAnterior);
    if (repetidasMin && repetidas < repetidasMin) return false;
    if (repetidasMax && repetidas > repetidasMax) return false;
  }

  // Validar pares
  if (paresMin !== undefined || paresMax !== undefined) {
    const pares = contarPares(jogo);
    if (paresMin && pares < paresMin) return false;
    if (paresMax && pares > paresMax) return false;
  }

  // Validar primos
  if (primosMin !== undefined || primosMax !== undefined) {
    const primos = contarPrimos(jogo);
    if (primosMin && primos < primosMin) return false;
    if (primosMax && primos > primosMax) return false;
  }

  // Validar Fibonacci
  if (fibonacciMin !== undefined || fibonacciMax !== undefined) {
    const fibonacci = contarFibonacci(jogo);
    if (fibonacciMin && fibonacci < fibonacciMin) return false;
    if (fibonacciMax && fibonacci > fibonacciMax) return false;
  }

  // Validar sequências
  if (sequenciasMin !== undefined || sequenciasMax !== undefined) {
    const sequencias = contarSequencias(jogo);
    if (sequenciasMin && sequencias < sequenciasMin) return false;
    if (sequenciasMax && sequencias > sequenciasMax) return false;
  }

  // Validar somatório
  if (somatorioMin !== undefined || somatorioMax !== undefined) {
    const somatorio = calcularSomatorio(jogo);
    if (somatorioMin && somatorio < somatorioMin) return false;
    if (somatorioMax && somatorio > somatorioMax) return false;
  }

  return true;
}

/**
 * MELHORADO: Gera múltiplas sugestões com análise
 */
export function gerarSugestoes(quantidade = 5, estrategia = 'misto', historico = null) {
  const sugestoes = [];

  for (let i = 0; i < quantidade; i++) {
    let jogo;
    let tipo;
    let descricao;

    switch (estrategia) {
      case 'aleatorio':
        jogo = gerarNumerosAleatorios();
        tipo = 'Aleatório';
        descricao = 'Gerado aleatoriamente';
        break;

      case 'balanceado':
        jogo = gerarBalanceado();
        tipo = 'Balanceado';
        descricao = 'Padrões estatísticos ideais';
        break;

      case 'quentes':
        jogo = gerarComNumerosQuentes(historico);
        tipo = 'Números Quentes';
        descricao = 'Baseado nos mais sorteados';
        break;

      case 'frios':
        jogo = gerarComNumerosFrios(historico);
        tipo = 'Números Frios';
        descricao = 'Números menos sorteados';
        break;

      case 'ia':
        jogo = gerarComIA(historico);
        tipo = 'Análise IA';
        descricao = 'Padrões inteligentes avançados';
        break;

      case 'misto':
      default:
        // Alterna entre todas as estratégias
        const estrategias = ['balanceado', 'quentes', 'frios', 'ia', 'aleatorio'];
        const estrategiaEscolhida = estrategias[i % estrategias.length];

        switch (estrategiaEscolhida) {
          case 'balanceado':
            jogo = gerarBalanceado();
            tipo = 'Balanceado';
            descricao = 'Padrões estatísticos';
            break;
          case 'quentes':
            jogo = gerarComNumerosQuentes(historico);
            tipo = 'Quentes';
            descricao = 'Mais sorteados';
            break;
          case 'frios':
            jogo = gerarComNumerosFrios(historico);
            tipo = 'Frios';
            descricao = 'Menos sorteados';
            break;
          case 'ia':
            jogo = gerarComIA(historico);
            tipo = 'IA';
            descricao = 'Análise inteligente';
            break;
          default:
            jogo = gerarNumerosAleatorios();
            tipo = 'Aleatório';
            descricao = 'Sorte pura';
        }
    }

    const analise = {
      pares: contarPares(jogo),
      impares: contarImpares(jogo),
      primos: contarPrimos(jogo),
      fibonacci: contarFibonacci(jogo),
      sequencias: contarSequencias(jogo),
      somatorio: calcularSomatorio(jogo),
      qualidade: calcularQualidadeJogo(jogo),
      linhas: analisarLinhas(jogo),
    };

    sugestoes.push({
      id: i + 1,
      numeros: jogo,
      tipo,
      descricao,
      ...analise,
    });
  }

  // Ordena por qualidade (melhor primeiro)
  return sugestoes.sort((a, b) => b.qualidade - a.qualidade);
}

// ==========================================
// EXPORTAÇÕES
// ==========================================

export default {
  // Geradores
  gerarNumerosAleatorios,
  gerarBalanceado,
  gerarComDistribuicaoInteligente,
  gerarComNumerosQuentes,
  gerarComNumerosFrios,
  gerarComIA,
  gerarComFiltros,
  gerarSugestoes,

  // Análises
  contarPares,
  contarImpares,
  contarPrimos,
  contarFibonacci,
  contarSequencias,
  calcularQualidadeJogo,
  classificarNumeros,
  analisarPadroes,

  // Constantes
  PADROES_REAIS,
  FIBONACCI,
  PRIMOS,
};