import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarUltimoConcurso, buscarHistorico } from '../services/lotofacilService';

const ResultadosContext = createContext();

const CACHE_KEY = '@lotomaster:resultados';
const CACHE_TIME = 60 * 60 * 1000; // 1 hora em millisegundos

export function ResultadosProvider({ children }) {
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // Carrega cache ao iniciar
  useEffect(() => {
    carregarCache();
  }, []);

  // Carrega dados do cache
  const carregarCache = async () => {
    try {
      // ⭐ LIMPA O CACHE CORROMPIDO (remova esta linha depois que funcionar)
      await AsyncStorage.removeItem(CACHE_KEY);
      console.log('🗑️ Cache limpo - buscando dados frescos');

      const cacheJson = await AsyncStorage.getItem(CACHE_KEY);

      if (cacheJson) {
        const cache = JSON.parse(cacheJson);
        const agora = new Date().getTime();
        const tempoDecorrido = agora - cache.timestamp;

        // Se cache tem menos de 1 hora, usa ele
        if (tempoDecorrido < CACHE_TIME) {
          console.log('💾 Usando cache');
          console.log('Cache último resultado:', cache.ultimoResultado);
          console.log('Números do cache:', cache.ultimoResultado?.numeros);

          setUltimoResultado(cache.ultimoResultado);
          setHistorico(cache.historico || []);
          setUltimaAtualizacao(new Date(cache.timestamp));
          setLoading(false);
          return;
        }
      }

      // Se não tem cache válido, busca da API
      console.log('🌐 Cache expirado ou inexistente, buscando da API');
      await atualizarResultados();
    } catch (error) {
      console.error('❌ Erro ao carregar cache:', error);
      await atualizarResultados();
    }
  };

  // Busca resultados da API
  const atualizarResultados = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log('🔄 Buscando último concurso...');

      // Busca último resultado
      const ultimo = await buscarUltimoConcurso();

      // ⭐ LOG DE DEBUG
      console.log('📊 Último resultado recebido:');
      console.log('  - Concurso:', ultimo?.numero);
      console.log('  - Data:', ultimo?.data);
      console.log('  - Números:', ultimo?.numeros);
      console.log('  - Quantidade de números:', ultimo?.numeros?.length);
      console.log('  - Objeto completo:', JSON.stringify(ultimo, null, 2));

      setUltimoResultado(ultimo);

      // Busca histórico (10 concursos)
      let hist = [];
      try {
        console.log('🔄 Buscando histórico...');
        hist = await buscarHistorico(10);

        // ⭐ LOG DE DEBUG
        console.log('📚 Histórico recebido:', hist.length, 'concursos');
        if (hist.length > 0) {
          console.log('  - Primeiro concurso:', hist[0]?.numero);
          console.log('  - Números do primeiro:', hist[0]?.numeros);
        }

        setHistorico(hist);
      } catch (histError) {
        console.warn('⚠️ Erro ao buscar histórico:', histError);
        setHistorico([]);
      }

      // Salva em cache
      const agora = new Date().getTime();
      const cache = {
        ultimoResultado: ultimo,
        historico: hist,
        timestamp: agora,
      };

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      setUltimaAtualizacao(new Date(agora));

      console.log('✅ Dados atualizados e salvos em cache');
    } catch (error) {
      console.error('❌ Erro ao atualizar resultados:', error);
      console.error('Stack:', error.stack);
      setErro(error.message || 'Erro ao buscar resultados');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    ultimoResultado,
    historico,
    loading,
    erro,
    ultimaAtualizacao,
    atualizarResultados,
  };

  return (
    <ResultadosContext.Provider value={value}>
      {children}
    </ResultadosContext.Provider>
  );
}

export function useResultados() {
  const context = useContext(ResultadosContext);

  if (!context) {
    throw new Error('useResultados deve ser usado dentro de ResultadosProvider');
  }

  return context;
}