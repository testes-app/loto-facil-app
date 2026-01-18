import axios from 'axios';

const BASE_URL_EXTERNAL = 'https://api.guidi.dev.br/loteria/lotofacil';
const BASE_URL_LOCAL = 'http://localhost:3001/api';

// Altere para BASE_URL_LOCAL quando o backend estiver rodando em produção/rede
const BASE_URL = BASE_URL_EXTERNAL;


export interface LotofacilResult {
  numero: number;
  dataApuracao?: string;
  data?: string;
  listaDezenas?: string[];
  dezenas?: string[];
  acumulado?: boolean;
  localSorteio?: string;
  valorEstimadoProximoConcurso?: number;
  dataProximoConcurso?: string;
  valorArrecadado?: number;
  valorAcumuladoEspecial?: number;
  listaRateio?: {
    faixa: number;
    numeroDeGanhadores: number;
    valorPremio: number;
    descricao: string;
  }[];
  listaMunicipioUFGanhadores?: {
    municipio: string;
    uf: string;
    ganhadores: number;
  }[];
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const fetchUltimoConcurso = async (): Promise<LotofacilResult> => {
  try {
    const response = await api.get('/ultimo');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar último concurso:', error);
    throw error;
  }
};

export const fetchConcurso = async (numero: number): Promise<LotofacilResult> => {
  try {
    const response = await api.get(`/${numero}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar concurso ${numero}:`, error);
    throw error;
  }
};
