import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { NumerosBola } from '../../components/NumerosBola';
import { buscarJogo, listarConcursos } from '../../database/operations';

interface Jogo {
  id: number;
  nome: string;
  numeros: number[];
  data_criacao: string;
}

interface Concurso {
  id: number;
  numero_concurso: number;
  data_sorteio: string;
  numeros_sorteados: number[];
}

interface ResultadoComparacao {
  concurso: Concurso;
  acertos: number[];
  totalAcertos: number;
}

export default function ConsultaScreen() {
  const params = useLocalSearchParams();
  const { jogoId, simulacao, numeros, nomeSimulacao } = params;

  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [resultados, setResultados] = useState<ResultadoComparacao[]>([]);
  const [resumo, setResumo] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(!!jogoId || simulacao === 'true');

  useFocusEffect(
    useCallback(() => {
      const isSimulacao = simulacao === 'true' || simulacao === true;
      const temDados = !!jogoId || (isSimulacao && !!numeros);

      if (temDados) {
        setLoading(true);
        carregarDados();
      } else {
        setLoading(false);
        setJogo(null);
        setResultados([]);
      }
    }, [jogoId, simulacao, numeros, nomeSimulacao])
  );

  const carregarDados = async () => {
    try {
      setResultados([]); // Limpa resultados anteriores
      setResumo({});
      setJogo(null); // Limpa o jogo anterior
      let jogoDb: any = null;

      const isSimulacao = simulacao === 'true' || simulacao === true;

      if (isSimulacao && numeros) {
        // Modo Simulação: usa os números vindos da tela de criação
        const listaNumeros = String(numeros).split(',').map(Number).filter(n => !isNaN(n));

        if (listaNumeros.length >= 15) {
          jogoDb = {
            id: 0,
            nome: (nomeSimulacao as string) || 'Simulação de Jogo',
            numeros: listaNumeros,
            data_criacao: new Date().toISOString(),
          };
        }
      } else if (jogoId) {
        // Modo Normal: busca no banco de dados apenas se tiver o ID
        const idNum = Number(jogoId);
        if (!isNaN(idNum)) {
          jogoDb = await buscarJogo(idNum);
        }
      }

      if (!jogoDb) {
        setLoading(false);
        return;
      }

      const concursos = await listarConcursos();
      const jogoNumeros = jogoDb.numeros;
      const jogoSet = new Set(jogoNumeros);

      const resultadosComparacao = concursos
        .filter(c => c.numeros_sorteados.length >= 15) // Apenas concursos válidos
        .map((concurso) => {
          // Pega apenas as 15 primeiras dezenas e remove duplicatas se houver
          const dezenasOficiais = Array.from(new Set(concurso.numeros_sorteados.slice(0, 15)));

          const acertos = dezenasOficiais.filter((num) => jogoSet.has(num));

          return {
            concurso: {
              ...concurso,
              numeros_sorteados: dezenasOficiais
            },
            acertos,
            totalAcertos: acertos.length,
          };
        });

      const resumoCalc: { [key: number]: number } = {};

      // Inicializar o resumo com zeros de 11 até 15
      for (let i = 11; i <= 15; i++) {
        resumoCalc[i] = 0;
      }

      resultadosComparacao.forEach((resultado) => {
        const total = resultado.totalAcertos;
        // Agora contamos qualquer acerto a partir de 11
        if (total >= 11) {
          resumoCalc[total] = (resumoCalc[total] || 0) + 1;
        }
      });

      setJogo(jogoDb as Jogo);
      setResultados(resultadosComparacao);
      setResumo(resumoCalc);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#7B3F9E' />
        <Text style={styles.loadingText}>Processando resultados...</Text>
      </View>
    );
  }

  if (!jogoId && simulacao !== 'true') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Selecione um jogo na aba "Meus Jogos" ou use o botão Consultar.</Text>
      </View>
    );
  }

  if (!jogo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Jogo não encontrado no banco de dados.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.jogoCard}>
        <Text style={styles.jogoNome}>{jogo?.nome}</Text>
        <NumerosBola numeros={jogo?.numeros || []} tamanho={36} />
      </View>

      <View style={styles.resumoCard}>
        <View style={styles.resumoHeaderRow}>
          <Text style={styles.resumoTitle}>📊 Resumo de Acertos</Text>
          <Text style={styles.totalConcursosText}>{resultados.length} concursos</Text>
        </View>
        <View style={styles.resumoTable}>
          {Object.keys(resumo)
            .map(Number)
            .sort((a, b) => b - a)
            .map((qtd) => (
              <View key={qtd} style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>{qtd} acertos:</Text>
                <Text style={styles.resumoValue}>{resumo[qtd] || 0}</Text>
              </View>
            ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Histórico de Concursos</Text>
    </View>
  );

  const renderItem = ({ item }: { item: ResultadoComparacao }) => (
    <View style={styles.concursoCard}>
      <View style={styles.concursoHeader}>
        <Text style={styles.concursoNumero}>
          Concurso {item.concurso.numero_concurso}
        </Text>
        <Text style={styles.concursoData}>
          {new Date(item.concurso.data_sorteio + 'T00:00:00').toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <NumerosBola
        numeros={item.concurso.numeros_sorteados}
        acertos={item.acertos}
        tamanho={36}
      />

      <View style={styles.acertosContainer}>
        <Text style={styles.acertosText}>
          {item.totalAcertos} acerto{item.totalAcertos !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={resultados}
        renderItem={renderItem}
        keyExtractor={(item) => item.concurso.numero_concurso.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  headerContent: {
    marginBottom: 8,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  jogoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jogoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#7B3F9E',
  },
  resumoCard: {
    backgroundColor: '#7B3F9E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resumoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  totalConcursosText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resumoTable: {
    gap: 8,
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 6,
  },
  resumoLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resumoValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  concursoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  concursoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  concursoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  concursoData: {
    fontSize: 14,
    color: '#666',
  },
  acertosContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  acertosText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B3F9E',
  },
});
