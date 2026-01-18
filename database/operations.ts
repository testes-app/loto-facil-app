import { concursosData } from '../constants/concursos-data';
import { fetchConcurso, fetchUltimoConcurso } from '../services/lotteryApi';
import { getDatabase } from './db';

export interface Jogo {
  id?: number;
  nome: string;
  numeros: number[];
  data_criacao: string;
}

export interface ConcursoDb {
  id?: number;
  numero_concurso: number;
  data_sorteio: string;
  numeros_sorteados: number[];
}

// ==================== AUXILIARES ====================

const processarDadosConcurso = (dados: any): ConcursoDb | null => {
  if (!dados) return null;

  const dezenas = dados.listaDezenas || dados.dezenas || [];
  if (!Array.isArray(dezenas) || dezenas.length < 15) {
    return null;
  }

  // Garantir EXATAMENTE 15 números (ignora extras da API) e converter para número
  const numerosFinal = dezenas.slice(0, 15).map(n => Number(n)).filter(n => !isNaN(n)).sort((a, b) => a - b);

  if (numerosFinal.length < 15) return null;

  const dataRaw = dados.dataApuracao || dados.data;
  let dataFormatada = dataRaw || new Date().toISOString().split('T')[0];

  if (dataFormatada && dataFormatada.includes('/')) {
    const [dia, mes, ano] = dataFormatada.split('/');
    dataFormatada = `${ano}-${mes}-${dia}`;
  }

  const numero = Number(dados.numero_concurso || dados.numero);
  if (isNaN(numero)) return null;

  return {
    numero_concurso: numero,
    data_sorteio: dataFormatada,
    numeros_sorteados: numerosFinal,
  };
};

// ==================== JOGOS ====================

export const salvarJogo = async (jogo: Jogo): Promise<number> => {
  const db = await getDatabase();
  const numerosStr = jogo.numeros.join(',');

  const result = await db.runAsync(
    'INSERT INTO jogos (nome, numeros, data_criacao) VALUES (?, ?, ?)',
    [jogo.nome, numerosStr, jogo.data_criacao]
  );

  return result.lastInsertRowId;
};

export const listarJogos = async (): Promise<Jogo[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM jogos ORDER BY id DESC', []);

  return rows.map((row: any) => ({
    id: row.id,
    nome: row.nome,
    numeros: row.numeros.split(',').map(Number),
    data_criacao: row.data_criacao,
  }));
};

export const buscarJogo = async (id: number): Promise<Jogo | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM jogos WHERE id = ?', [id]);

  if (!row) return null;

  return {
    id: (row as any).id,
    nome: (row as any).nome,
    numeros: (row as any).numeros.split(',').map(Number),
    data_criacao: (row as any).data_criacao,
  };
};

export const deletarJogo = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM jogos WHERE id = ?', [id]);
};

// ==================== CONCURSOS ====================

export const salvarConcurso = async (concurso: ConcursoDb): Promise<void> => {
  const db = await getDatabase();
  const numerosStr = concurso.numeros_sorteados.join(',');

  await db.runAsync(
    'INSERT OR REPLACE INTO concursos (numero_concurso, data_sorteio, numeros_sorteados) VALUES (?, ?, ?)',
    [concurso.numero_concurso, concurso.data_sorteio, numerosStr]
  );
};

export const listarConcursos = async (): Promise<ConcursoDb[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM concursos ORDER BY numero_concurso DESC', []);

  return rows.map((row: any) => ({
    id: row.id,
    numero_concurso: row.numero_concurso,
    data_sorteio: row.data_sorteio,
    numeros_sorteados: row.numeros_sorteados.split(',').map(Number),
  }));
};

export const buscarConcurso = async (numero: number): Promise<ConcursoDb | null> => {
  if (isNaN(numero) || numero <= 0) return null;

  const db = await getDatabase();
  try {
    const row = await db.getFirstAsync(
      'SELECT * FROM concursos WHERE numero_concurso = ?',
      [numero]
    );

    if (row) {
      return {
        id: (row as any).id,
        numero_concurso: (row as any).numero_concurso,
        data_sorteio: (row as any).data_sorteio,
        numeros_sorteados: (row as any).numeros_sorteados.split(',').map(Number),
      };
    }

    const dados = await fetchConcurso(numero);
    const concurso = processarDadosConcurso(dados);
    if (concurso) {
      await salvarConcurso(concurso);
      return concurso;
    }
  } catch (error) {
    console.error(`Erro ao buscar concurso ${numero}:`, error);
  }
  return null;
};

export const sincronizarUltimosConcursos = async (): Promise<void> => {
  try {
    const ultimoApi = await fetchUltimoConcurso();
    const numeroUltimoApi = ultimoApi.numero;

    const db = await getDatabase();
    const row = await db.getFirstAsync('SELECT MAX(numero_concurso) as max_numero FROM concursos', []);
    const ultimoDb = (row as any)?.max_numero || 0;

    if (numeroUltimoApi > ultimoDb) {
      const inicio = ultimoDb + 1;
      for (let i = inicio; i <= numeroUltimoApi; i++) {
        try {
          const dados = await fetchConcurso(i);
          const concurso = processarDadosConcurso(dados);
          if (concurso) {
            await salvarConcurso(concurso);
          }
        } catch (err) {
          console.error(`Erro ao sincronizar concurso ${i}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
};

export const sincronizarHistoricoCompleto = async (
  onProgress?: (progresso: number, total: number) => void,
  sobrescreverTudo: boolean = false
): Promise<void> => {
  try {
    const ultimoApi = await fetchUltimoConcurso();
    const totalConcursos = ultimoApi.numero;

    const db = await getDatabase();
    let numerosNoDb = new Set<number>();

    if (sobrescreverTudo) {
      await db.runAsync('DELETE FROM concursos');
    } else {
      const rows = await db.getAllAsync('SELECT numero_concurso FROM concursos', []);
      numerosNoDb = new Set(rows.map((r: any) => r.numero_concurso));
    }

    const faltantes = [];
    for (let i = 1; i <= totalConcursos; i++) {
      if (sobrescreverTudo || !numerosNoDb.has(i)) {
        faltantes.push(i);
      }
    }

    if (faltantes.length === 0) return;

    const totalFaltantes = faltantes.length;
    let sincronizados = 0;
    const CHUNK_SIZE = 15;
    const CONCURRENCY = 5;

    for (let i = 0; i < faltantes.length; i += CHUNK_SIZE) {
      const chunk = faltantes.slice(i, i + CHUNK_SIZE);
      const resultadosChunk: ConcursoDb[] = [];

      for (let j = 0; j < chunk.length; j += CONCURRENCY) {
        const subBatch = chunk.slice(j, j + CONCURRENCY);
        const promessas = subBatch.map(async (numero) => {
          try {
            const dados = await fetchConcurso(numero);
            return processarDadosConcurso(dados);
          } catch (err) {
            return null;
          }
        });

        const resultados = await Promise.all(promessas);
        resultados.forEach(r => { if (r) resultadosChunk.push(r); });
      }

      if (resultadosChunk.length > 0) {
        await db.withTransactionAsync(async () => {
          for (const concurso of resultadosChunk) {
            const numerosStr = concurso.numeros_sorteados.join(',');
            await db.runAsync(
              'INSERT OR REPLACE INTO concursos (numero_concurso, data_sorteio, numeros_sorteados) VALUES (?, ?, ?)',
              [concurso.numero_concurso, concurso.data_sorteio, numerosStr]
            );
            sincronizados++; // Incrementar apenas quando salvar com sucesso
          }
        });
      }

      if (onProgress) {
        onProgress(Math.min(sincronizados, totalFaltantes), totalFaltantes);
      }

      // Se houveram falhas no lote (chunk), avisar no log
      if (resultadosChunk.length < chunk.length) {
        console.warn(`${chunk.length - resultadosChunk.length} concursos falharam no lote de ${chunk[0]} a ${chunk[chunk.length - 1]}`);
      }

      await new Promise(resolve => setTimeout(resolve, 50)); // Um pouco mais de fôlego
    }
  } catch (error) {
    console.error('Erro na sincronização completa:', error);
    throw error;
  }
};

export const obterFrequenciaDezenas = async (limite: number = 100): Promise<{
  frequencias: { numero: number, frequencia: number }[],
  concursoInicio: number,
  concursoFim: number
}> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC LIMIT ?',
    [limite]
  );

  if (rows.length === 0) {
    return { frequencias: [], concursoInicio: 0, concursoFim: 0 };
  }

  const freq: { [key: number]: number } = {};
  for (let i = 1; i <= 25; i++) freq[i] = 0;

  let minConcurso = (rows[0] as any).numero_concurso;
  let maxConcurso = (rows[0] as any).numero_concurso;

  rows.forEach((row: any) => {
    const numConcurso = row.numero_concurso;
    if (numConcurso < minConcurso) minConcurso = numConcurso;
    if (numConcurso > maxConcurso) maxConcurso = numConcurso;

    const numeros = row.numeros_sorteados.split(',').map(Number);
    numeros.forEach((num: number) => {
      if (freq[num] !== undefined) freq[num]++;
    });
  });

  const frequencias = Object.keys(freq)
    .map(num => ({ numero: Number(num), frequencia: freq[Number(num)] }))
    .sort((a, b) => b.frequencia - a.frequencia || b.numero - a.numero);

  return {
    frequencias,
    concursoInicio: minConcurso,
    concursoFim: maxConcurso
  };
};

export const obterEstatisticasAtrasos = async (limiteOcorrencias?: number): Promise<{
  data: {
    numero: number,
    atraso: number,
    ocorrencias: number
  }[],
  concursoInicio: number,
  concursoFim: number
}> => {
  const db = await getDatabase();
  const todos = await db.getAllAsync(
    'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC',
    []
  );

  if (todos.length === 0) return { data: [], concursoInicio: 0, concursoFim: 0 };

  const ultimoConcurso = (todos[0] as any).numero_concurso;
  const primeiroConcurso = (todos[todos.length - 1] as any).numero_concurso;
  const stats: { [key: number]: { ultimoVisto: number, ocorrencias: number } } = {};

  for (let i = 1; i <= 25; i++) {
    stats[i] = { ultimoVisto: -1, ocorrencias: 0 };
  }

  todos.forEach((row: any, index: number) => {
    const numeros = row.numeros_sorteados.split(',').map(Number);
    numeros.forEach((n: number) => {
      if (stats[n]) {
        if (!limiteOcorrencias || index < limiteOcorrencias) stats[n].ocorrencias++;
        if (stats[n].ultimoVisto === -1) stats[n].ultimoVisto = row.numero_concurso;
      }
    });
  });

  const data = Object.keys(stats).map(num => {
    const n = Number(num);
    const ultimo = stats[n].ultimoVisto;
    return {
      numero: n,
      atraso: ultimo === -1 ? todos.length : ultimoConcurso - ultimo,
      ocorrencias: stats[n].ocorrencias
    };
  }).sort((a, b) => b.atraso - a.atraso || a.numero - b.numero);

  return {
    data,
    concursoInicio: limiteOcorrencias ? (ultimoConcurso - limiteOcorrencias + 1 > 0 ? ultimoConcurso - limiteOcorrencias + 1 : 1) : primeiroConcurso,
    concursoFim: ultimoConcurso
  };
};

export const obterEstatisticasLinhas = async (limite?: number): Promise<{
  id: number,
  label: string,
  ocorrencias: number,
  porcentagem: string,
  ultimoConcurso: number,
  concursoInicio: number,
  concursoFim: number
}[]> => {
  const db = await getDatabase();
  const query = limite
    ? 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC LIMIT ?'
    : 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC';

  const params = limite ? [limite] : [];
  const rows = await db.getAllAsync(query, params);

  if (rows.length === 0) return [];

  const minConcurso = (rows[rows.length - 1] as any).numero_concurso;
  const maxConcurso = (rows[0] as any).numero_concurso;

  const stats = [1, 2, 3, 4, 5].map(l => ({
    id: l,
    label: `Linha ${l}`,
    ocorrencias: 0,
    ultimoConcurso: 0,
    dezenasUltimoNumeros: [] as number[],
    numFrequencias: [] as { num: number, count: number }[]
  }));

  rows.forEach((row: any) => {
    const numeros = row.numeros_sorteados.split(',').map(Number);
    stats.forEach(s => {
      const inicio = (s.id - 1) * 5 + 1;
      const fim = s.id * 5;
      const dezenasNaLinha = numeros.filter((n: number) => n >= inicio && n <= fim);

      dezenasNaLinha.forEach(d => {
        let f = s.numFrequencias.find(nf => nf.num === d);
        if (!f) {
          f = { num: d, count: 0 };
          s.numFrequencias.push(f);
        }
        f.count++;
      });

      const qtdNaLinha = dezenasNaLinha.length;
      s.ocorrencias += qtdNaLinha;
      if (qtdNaLinha > 0 && s.ultimoConcurso === 0) {
        s.ultimoConcurso = row.numero_concurso;
        s.dezenasUltimoNumeros = dezenasNaLinha.sort((a, b) => a - b);
      }
    });
  });

  stats.forEach(s => s.numFrequencias.sort((a, b) => a.num - b.num));

  const totalDezenasSorteadoNoPeriodo = rows.length * 15;

  return stats.map(s => ({
    ...s,
    porcentagem: ((s.ocorrencias / totalDezenasSorteadoNoPeriodo) * 100).toFixed(2) + '%',
    concursoInicio: minConcurso,
    concursoFim: maxConcurso
  }));
};

export const obterEstatisticasColunas = async (limite?: number): Promise<{
  id: number,
  label: string,
  ocorrencias: number,
  porcentagem: string,
  ultimoConcurso: number,
  concursoInicio: number,
  concursoFim: number
}[]> => {
  const db = await getDatabase();
  const query = limite
    ? 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC LIMIT ?'
    : 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC';

  const params = limite ? [limite] : [];
  const rows = await db.getAllAsync(query, params);

  if (rows.length === 0) return [];

  const minConcurso = (rows[rows.length - 1] as any).numero_concurso;
  const maxConcurso = (rows[0] as any).numero_concurso;

  const stats = [1, 2, 3, 4, 5].map(c => ({
    id: c,
    label: `Coluna ${c}`,
    ocorrencias: 0,
    ultimoConcurso: 0,
    dezenasUltimoNumeros: [] as number[],
    numFrequencias: [] as { num: number, count: number }[]
  }));

  rows.forEach((row: any) => {
    const numeros = row.numeros_sorteados.split(',').map(Number);
    stats.forEach(s => {
      const dezenasNaColuna = numeros.filter((n: number) => {
        const resto = n % 5;
        if (s.id === 5) return resto === 0;
        return resto === s.id;
      });

      dezenasNaColuna.forEach(d => {
        let f = s.numFrequencias.find(nf => nf.num === d);
        if (!f) {
          f = { num: d, count: 0 };
          s.numFrequencias.push(f);
        }
        f.count++;
      });

      const qtdNaColuna = dezenasNaColuna.length;
      s.ocorrencias += qtdNaColuna;
      if (qtdNaColuna > 0 && s.ultimoConcurso === 0) {
        s.ultimoConcurso = row.numero_concurso;
        s.dezenasUltimoNumeros = dezenasNaColuna.sort((a, b) => a - b);
      }
    });
  });

  stats.forEach(s => s.numFrequencias.sort((a, b) => a.num - b.num));

  const totalDezenasSorteadoNoPeriodo = rows.length * 15;

  return stats.map(s => ({
    ...s,
    porcentagem: ((s.ocorrencias / totalDezenasSorteadoNoPeriodo) * 100).toFixed(2) + '%',
    concursoInicio: minConcurso,
    concursoFim: maxConcurso
  }));
};

export const obterEstatisticasDezenaTipo = async (tipo: 'par' | 'impar' | 'primo' | 'fibonacci', limite?: number): Promise<{
  id: number,
  label: string,
  ocorrencias: number,
  porcentagem: string,
  ultimoConcurso: number,
  dezenasUltimoNumeros: number[],
  concursoInicio: number,
  concursoFim: number
}[]> => {
  const db = await getDatabase();
  const query = limite
    ? 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC LIMIT ?'
    : 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC';

  const params = limite ? [limite] : [];
  const rows = await db.getAllAsync(query, params);

  if (rows.length === 0) return [];

  const minConcurso = (rows[rows.length - 1] as any).numero_concurso;
  const maxConcurso = (rows[0] as any).numero_concurso;

  const primos = [2, 3, 5, 7, 11, 13, 17, 19, 23]; // Dezenas Primas (até 25)
  const fibonacci = [1, 2, 3, 5, 8, 13, 21]; // Dezenas Fibonacci

  const counts: { [key: number]: { ocorrencias: number, ultimoConcurso: number, dezenasUltimoNumeros: number[] } } = {};

  rows.forEach((row: any) => {
    const numeros = row.numeros_sorteados.split(',').map(Number);
    let dezenasTipo: number[] = [];

    if (tipo === 'par') dezenasTipo = numeros.filter((n: number) => n % 2 === 0);
    else if (tipo === 'impar') dezenasTipo = numeros.filter((n: number) => n % 2 !== 0);
    else if (tipo === 'primo') dezenasTipo = numeros.filter((n: number) => primos.includes(n));
    else if (tipo === 'fibonacci') dezenasTipo = numeros.filter((n: number) => fibonacci.includes(n));

    const qtd = dezenasTipo.length;

    if (!counts[qtd]) {
      counts[qtd] = { ocorrencias: 0, ultimoConcurso: 0, dezenasUltimoNumeros: [] };
    }
    counts[qtd].ocorrencias++;
    if (counts[qtd].ultimoConcurso === 0) {
      counts[qtd].ultimoConcurso = row.numero_concurso;
      counts[qtd].dezenasUltimoNumeros = dezenasTipo.sort((a, b) => a - b);
    }
  });

  const totalConcursos = rows.length;
  const stats = Object.keys(counts)
    .map(key => {
      const q = Number(key);
      return {
        id: q,
        label: q.toString(),
        ocorrencias: counts[q].ocorrencias,
        porcentagem: ((counts[q].ocorrencias / totalConcursos) * 100).toFixed(2) + '%',
        ultimoConcurso: counts[q].ultimoConcurso,
        dezenasUltimoNumeros: counts[q].dezenasUltimoNumeros,
        concursoInicio: minConcurso,
        concursoFim: maxConcurso
      };
    })
    .sort((a, b) => a.id - b.id);

  return stats;
};

export const obterEstatisticasRepeticoes = async (limite?: number): Promise<{
  id: number,
  ocorrencias: number,
  porcentagem: string,
  ultimoConcurso: number,
  dezenasUltimoNumeros: number[],
  concursoInicio: number,
  concursoFim: number
}[]> => {
  const db = await getDatabase();
  const query = limite
    ? 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC LIMIT ?'
    : 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC';

  const params = limite ? [limite + 1] : []; // +1 para comparar o último do período com o anterior
  const rows = await db.getAllAsync(query, params);

  if (rows.length < 2) return [];

  const counts: { [key: number]: { ocorrencias: number, ultimoConcurso: number, dezenasUltimo: number[] } } = {};

  for (let i = 0; i < rows.length - 1; i++) {
    const atual = (rows[i] as any).numeros_sorteados.split(',').map(Number);
    const anterior = (rows[i + 1] as any).numeros_sorteados.split(',').map(Number);
    const anteriorSet = new Set(anterior);

    const repetidos = atual.filter((n: number) => anteriorSet.has(n));
    const qtd = repetidos.length;

    if (!counts[qtd]) {
      counts[qtd] = { ocorrencias: 0, ultimoConcurso: 0, dezenasUltimo: [] };
    }
    counts[qtd].ocorrencias++;
    if (counts[qtd].ultimoConcurso === 0) {
      counts[qtd].ultimoConcurso = (rows[i] as any).numero_concurso;
      counts[qtd].dezenasUltimo = repetidos.sort((a, b) => a - b);
    }
  }

  const totalConcursos = rows.length - 1;
  const minConcurso = (rows[rows.length - 1] as any).numero_concurso;
  const maxConcurso = (rows[0] as any).numero_concurso;

  return Object.keys(counts).map(key => {
    const q = Number(key);
    return {
      id: q,
      ocorrencias: counts[q].ocorrencias,
      porcentagem: ((counts[q].ocorrencias / totalConcursos) * 100).toFixed(2) + '%',
      ultimoConcurso: counts[q].ultimoConcurso,
      dezenasUltimoNumeros: counts[q].dezenasUltimo,
      concursoInicio: minConcurso,
      concursoFim: maxConcurso
    };
  }).sort((a, b) => a.id - b.id);
};

export const obterEstatisticasGeraisDistribuicao = async (tipo: 'soma' | 'sequencia', limite?: number): Promise<{
  id: number | string,
  ocorrencias: number,
  porcentagem: string,
  ultimoConcurso: number,
  dezenasUltimoNumeros: number[],
  concursoInicio: number,
  concursoFim: number
}[]> => {
  const db = await getDatabase();
  const query = limite
    ? 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC LIMIT ?'
    : 'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso DESC';

  const rows = await db.getAllAsync(query, limite ? [limite] : []);
  if (rows.length === 0) return [];

  const counts: { [key: string]: { ocorrencias: number, ultimoConcurso: number, dezenasUltimo: number[] } } = {};

  rows.forEach((row: any) => {
    const numeros = row.numeros_sorteados.split(',').map(Number).sort((a: number, b: number) => a - b);
    let valor: number = 0;
    let dezenasDestaque: number[] = numeros;

    if (tipo === 'soma') {
      const soma = numeros.reduce((a: number, b: number) => a + b, 0);
      // Definir as faixas conforme a imagem do usuário (15 em 15)
      let faixa = "";
      if (soma >= 120 && soma <= 134) faixa = "120-134";
      else if (soma >= 135 && soma <= 149) faixa = "135-149";
      else if (soma >= 150 && soma <= 164) faixa = "150-164";
      else if (soma >= 165 && soma <= 179) faixa = "165-179";
      else if (soma >= 180 && soma <= 194) faixa = "180-194";
      else if (soma >= 195 && soma <= 209) faixa = "195-209";
      else if (soma >= 210 && soma <= 224) faixa = "210-224";
      else if (soma >= 225 && soma <= 239) faixa = "225-239";
      else if (soma >= 240 && soma <= 254) faixa = "240-254";
      else if (soma >= 255) faixa = "255-270";
      else faixa = "Outros";

      valor = faixa;
      dezenasDestaque = numeros;
    } else {
      let maxSeq = 1;
      let atualSeq = 1;
      let seqTemp: number[] = [numeros[0]];
      let melhorSeq: number[] = [numeros[0]];

      for (let i = 0; i < numeros.length - 1; i++) {
        if (numeros[i + 1] === numeros[i] + 1) {
          atualSeq++;
          seqTemp.push(numeros[i + 1]);
        } else {
          if (atualSeq > maxSeq) {
            maxSeq = atualSeq;
            melhorSeq = [...seqTemp];
          }
          atualSeq = 1;
          seqTemp = [numeros[i + 1]];
        }
      }
      if (atualSeq > maxSeq) {
        maxSeq = atualSeq;
        melhorSeq = [...seqTemp];
      }
      valor = maxSeq;
      dezenasDestaque = melhorSeq;
    }

    const key = valor.toString();
    if (!counts[key]) {
      counts[key] = { ocorrencias: 0, ultimoConcurso: 0, dezenasUltimo: [] };
    }
    counts[key].ocorrencias++;
    if (counts[key].ultimoConcurso === 0) {
      counts[key].ultimoConcurso = row.numero_concurso;
      counts[key].dezenasUltimo = dezenasDestaque;
    }
  });

  const total = rows.length;
  return Object.keys(counts).map(key => ({
    id: key,
    ocorrencias: counts[key].ocorrencias,
    porcentagem: ((counts[key].ocorrencias / total) * 100).toFixed(2) + '%',
    ultimoConcurso: counts[key].ultimoConcurso,
    dezenasUltimoNumeros: counts[key].dezenasUltimo,
    concursoInicio: (rows[rows.length - 1] as any).numero_concurso,
    concursoFim: (rows[0] as any).numero_concurso
  })).sort((a, b) => {
    if (tipo === 'soma') {
      const valA = a.id === 'Outros' ? 0 : Number((a.id as string).split('-')[0]);
      const valB = b.id === 'Outros' ? 0 : Number((b.id as string).split('-')[0]);
      return valA - valB;
    }
    return Number(a.id) - Number(b.id);
  });
};

export const obterEstatisticasCiclosHistorico = async (): Promise<{
  media: string,
  cicloAtual: { numerosSorteados: number[], numerosFaltantes: number[] },
  historico: { cicloId: number, inicio: number, fim: number | string, quantidade: number }[]
}> => {
  const db = await getDatabase();
  const todos = await db.getAllAsync(
    'SELECT numero_concurso, numeros_sorteados FROM concursos ORDER BY numero_concurso ASC',
    []
  );

  const ciclos = [];
  let numerosNoCiclo = new Set<number>();
  let concursosNoCiclo: number[] = [];
  let cicloAtualId = 1;

  todos.forEach((row: any) => {
    const numeros = row.numeros_sorteados.split(',').map(Number);
    numeros.forEach((n: number) => numerosNoCiclo.add(n));
    concursosNoCiclo.push(row.numero_concurso);

    if (numerosNoCiclo.size === 25) {
      ciclos.push({
        cicloId: cicloAtualId++,
        inicio: concursosNoCiclo[0],
        fim: concursosNoCiclo[concursosNoCiclo.length - 1],
        quantidade: concursosNoCiclo.length,
        numerosSorteados: Array.from(numerosNoCiclo)
      });
      numerosNoCiclo = new Set<number>();
      concursosNoCiclo = [];
    }
  });

  const h: any[] = [...ciclos].reverse();
  const numerosSorteadosAtuais = Array.from(numerosNoCiclo);
  const numerosFaltantesAtuais = [];
  for (let i = 1; i <= 25; i++) {
    if (!numerosNoCiclo.has(i)) numerosFaltantesAtuais.push(i);
  }

  if (concursosNoCiclo.length > 0) {
    h.unshift({
      cicloId: cicloAtualId,
      inicio: concursosNoCiclo[0],
      fim: '-',
      quantidade: concursosNoCiclo.length,
      numerosSorteados: numerosSorteadosAtuais
    });
  }

  const ciclosFechados = ciclos.filter(c => c.quantidade > 0);
  const mediaVal = ciclosFechados.length > 0
    ? (ciclosFechados.reduce((acc, curr) => acc + curr.quantidade, 0) / ciclosFechados.length).toFixed(2)
    : "0.00";

  return {
    media: mediaVal,
    cicloAtual: { numerosSorteados: numerosSorteadosAtuais, numerosFaltantes: numerosFaltantesAtuais },
    historico: h
  };
};

export const obterEstatisticasCiclosDistribuicao = async (): Promise<{
  id: number,
  ocorrencias: number,
  porcentagem: string,
  ultimoConcurso: number,
  dezenasUltimoNumeros: number[],
  concursoInicio: number,
  concursoFim: number
}[]> => {
  const ciclos = await obterEstatisticasCiclosHistorico();
  const ciclosFechados = ciclos.filter(c => c.numerosFaltantes.length === 0);

  const counts: { [key: number]: { ocorrencias: number, ultimoCiclo: number, concursos: number[] } } = {};

  ciclosFechados.forEach(c => {
    const qtd = c.concursos.length;
    if (!counts[qtd]) counts[qtd] = { ocorrencias: 0, ultimoCiclo: 0, concursos: [] };
    counts[qtd].ocorrencias++;
    if (counts[qtd].ultimoCiclo === 0) {
      counts[qtd].ultimoCiclo = c.cicloId;
      counts[qtd].concursos = c.concursos;
    }
  });

  const total = ciclosFechados.length;
  return Object.keys(counts).map(key => {
    const q = Number(key);
    return {
      id: q,
      ocorrencias: counts[q].ocorrencias,
      porcentagem: ((counts[q].ocorrencias / total) * 100).toFixed(2) + '%',
      ultimoConcurso: counts[q].concursos[counts[q].concursos.length - 1],
      dezenasUltimoNumeros: [], // Ciclos não mostram dezenas específicas no modal
      concursoInicio: 1,
      concursoFim: ciclos[0].cicloId
    };
  }).sort((a, b) => a.id - b.id);
};

export const verificarConcursosFaltantes = async (): Promise<number[]> => {
  try {
    const ultimoApi = await fetchUltimoConcurso();
    const totalApi = ultimoApi.numero;

    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT numero_concurso FROM concursos', []);
    const numerosNoDb = new Set(rows.map((r: any) => r.numero_concurso));

    const faltantes = [];
    for (let i = 1; i <= totalApi; i++) {
      if (!numerosNoDb.has(i)) {
        faltantes.push(i);
      }
    }
    return faltantes;
  } catch (error) {
    console.error('Erro ao verificar faltantes:', error);
    return [];
  }
};

export const contarTotalConcursos = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync('SELECT COUNT(*) as total FROM concursos', []);
  return (result as any)?.total || 0;
};

// ==================== SEED ====================

export const popularConcursosIniciais = async (): Promise<void> => {
  const db = await getDatabase();
  const count = await db.getFirstAsync('SELECT COUNT(*) as total FROM concursos', []);
  if ((count as any).total > 0) return;

  for (const concurso of concursosData) {
    await salvarConcurso({
      numero_concurso: concurso.numero,
      data_sorteio: concurso.data,
      numeros_sorteados: concurso.numeros,
    });
  }
};
