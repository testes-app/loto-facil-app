import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JogosContext = createContext();

export function JogosProvider({ children }) {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega jogos salvos ao iniciar
  useEffect(() => {
    carregarJogos();
  }, []);

  // Carrega jogos do AsyncStorage
  const carregarJogos = async () => {
    try {
      const jogosJson = await AsyncStorage.getItem('@lotomaster:jogos');
      if (jogosJson) {
        setJogos(JSON.parse(jogosJson));
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salva jogos no AsyncStorage
  const salvarJogos = async (novosJogos) => {
    try {
      await AsyncStorage.setItem('@lotomaster:jogos', JSON.stringify(novosJogos));
      setJogos(novosJogos);
    } catch (error) {
      console.error('Erro ao salvar jogos:', error);
    }
  };

  // Adiciona novo jogo
  const adicionarJogo = async (jogo) => {
    const novoJogo = {
      id: Date.now().toString(),
      ...jogo,
      dataCriacao: new Date().toISOString(),
    };
    
    const novosJogos = [...jogos, novoJogo];
    await salvarJogos(novosJogos);
    return novoJogo;
  };

  // Remove jogo
  const removerJogo = async (id) => {
    const novosJogos = jogos.filter(j => j.id !== id);
    await salvarJogos(novosJogos);
  };

  // Atualiza jogo
  const atualizarJogo = async (id, dadosAtualizados) => {
    const novosJogos = jogos.map(j => 
      j.id === id ? { ...j, ...dadosAtualizados } : j
    );
    await salvarJogos(novosJogos);
  };

  // Busca jogo por ID
  const buscarJogo = (id) => {
    return jogos.find(j => j.id === id);
  };

  // Limpa todos os jogos
  const limparJogos = async () => {
    await salvarJogos([]);
  };

  const value = {
    jogos,
    loading,
    adicionarJogo,
    removerJogo,
    atualizarJogo,
    buscarJogo,
    limparJogos,
    carregarJogos,
  };

  return (
    <JogosContext.Provider value={value}>
      {children}
    </JogosContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useJogos() {
  const context = useContext(JogosContext);
  if (!context) {
    throw new Error('useJogos deve ser usado dentro de JogosProvider');
  }
  return context;
}

export default JogosContext;
