import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { JogoCard } from '../../components/JogoCard';
import { buscarConcurso, buscarUltimoConcurso, ConcursoDb, deletarJogo, listarJogos } from '../../database/operations';

interface Jogo {
  id: number;
  nome: string;
  numeros: number[];
  data_criacao: string;
}

export default function MeusJogosScreen() {
  const router = useRouter();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [jogoSelecionadoId, setJogoSelecionadoId] = useState<number | null>(null);
  const [concursoAlvo, setConcursoAlvo] = useState<number>(0);
  const [concursoAlvoDados, setConcursoAlvoDados] = useState<ConcursoDb | null>(null);

  useFocusEffect(
    useCallback(() => {
      carregarJogos();
      // Se ainda não temos concurso alvo definido, buscar o ultimo
      if (concursoAlvo === 0) {
        carregarUltimoConcurso();
      }
    }, [])
  );

  // Quando o concurso alvo muda (pelo usuário), buscar os dados dele
  React.useEffect(() => {
    if (concursoAlvo > 0) {
      buscarDadosConcurso(concursoAlvo);
    }
  }, [concursoAlvo]);

  const carregarUltimoConcurso = async () => {
    try {
      const ultimo = await buscarUltimoConcurso();
      if (ultimo) {
        setConcursoAlvo(ultimo.numero_concurso);
        // O buscarDadosConcurso será chamado pelo useEffect
      }
    } catch (e) { }
  };

  const buscarDadosConcurso = async (numero: number) => {
    try {
      const dados = await buscarConcurso(numero);
      setConcursoAlvoDados(dados);
    } catch (error) {
      console.log("Concurso não encontrado no banco local");
      setConcursoAlvoDados(null);
    }
  };

  const carregarJogos = async () => {
    try {
      const jogosDb = await listarJogos();
      setJogos(jogosDb as Jogo[]);
    } catch (error) {
      console.error('Erro ao listar jogos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    Alert.alert(
      'Deletar Jogo',
      'Tem certeza que deseja excluir este jogo?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarJogo(id);
              setJogoSelecionadoId(null);
              carregarJogos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o jogo.');
            }
          },
        },
      ]
    );
  };

  const handleSelecionar = (id: number) => {
    if (jogoSelecionadoId === id) {
      setJogoSelecionadoId(null);
    } else {
      setJogoSelecionadoId(id);
    }
  };

  const handleConsultar = () => {
    if (jogoSelecionadoId) {
      router.push({ pathname: '/consulta', params: { jogoId: jogoSelecionadoId } });
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER SUPERIOR (ROXO CLARO) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} color="#FFF" /></TouchableOpacity>
          <View style={styles.selectorContainer}>
            <View style={styles.selectorTextRow}>
              <Text style={styles.headerTitle}>LF</Text>
              <Ionicons name="caret-down" size={16} color="#FFF" style={{ marginLeft: 5, marginBottom: 2 }} />
            </View>
            <View style={styles.selectorUnderline} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity><Ionicons name="search-outline" size={26} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="ellipsis-vertical" size={26} color="#FFF" style={{ marginLeft: 15 }} /></TouchableOpacity>
        </View>
      </View>

      {/* SUB-HEADER DE ÍCONES (BRANCO) */}
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="logo-usd" size={28} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.subTabItem, styles.subTabActive]}>
          <Ionicons name="star" size={28} color="#27AE60" />
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="add" size={32} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/estatisticas')}>
          <Ionicons name="stats-chart" size={28} color="#999" />
        </TouchableOpacity>
      </View>

      {/* SELETOR DE CONCURSO (BARRA CINZA) */}
      <View style={styles.concursoSelectorRow}>
        <Text style={styles.concursoLabel}>Concurso:</Text>
        <View style={styles.concursoBox}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => setConcursoAlvo(prev => Math.max(1, prev - 1))}>
            <Ionicons name="chevron-back" size={24} color="#5D2E7A" />
          </TouchableOpacity>

          <TextInput
            style={styles.concursoInput}
            value={concursoAlvo > 0 ? concursoAlvo.toString() : ''}
            keyboardType="numeric"
            onChangeText={(text) => {
              const num = parseInt(text);
              if (!isNaN(num)) setConcursoAlvo(num);
              else if (text === '') setConcursoAlvo(0);
            }}
            onBlur={() => {
              if (concursoAlvo === 0) carregarUltimoConcurso();
            }}
          />

          <TouchableOpacity style={styles.arrowBtnRight} onPress={() => setConcursoAlvo(prev => prev + 1)}>
            <Ionicons name="chevron-forward" size={24} color="#5D2E7A" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => buscarDadosConcurso(concursoAlvo)}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          Meus Jogos: {jogoSelecionadoId ? '1 jogo selecionado' : ''}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#A556BE" style={{ marginTop: 50 }} />
        ) : jogos.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Você ainda não salvou nenhum jogo.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.createBtnText}>CRIAR AGORA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jogos.map((jogo) => {
            let conferencia = null;
            if (concursoAlvoDados && concursoAlvoDados.numeros_sorteados) {
              const sorteados = concursoAlvoDados.numeros_sorteados; // Já é number[]
              const acertos = jogo.numeros.filter(n => sorteados.includes(n)).length;
              conferencia = { acertos, concurso: concursoAlvo };
            }

            return (
              <JogoCard
                key={jogo.id}
                id={jogo.id}
                nome={jogo.nome}
                numeros={jogo.numeros}
                selecionado={jogoSelecionadoId === jogo.id}
                conferencia={conferencia}
                onPress={() => handleSelecionar(jogo.id)}
                onDelete={() => handleDeletar(jogo.id)}
              />
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTÕES FLUTUANTES (FAB) */}
      {jogoSelecionadoId && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabButton} onPress={handleConsultar}>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabButton, { marginTop: 15 }]}
            onPress={() => handleDeletar(jogoSelecionadoId)}
          >
            <Ionicons name="trash" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE' },
  header: {
    height: 60,
    backgroundColor: '#A556BE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 5
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  selectorContainer: { marginLeft: 20, alignItems: 'center' },
  selectorTextRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  selectorUnderline: { width: 40, height: 2, backgroundColor: 'white', opacity: 0.8 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  subHeader: {
    height: 55,
    backgroundColor: 'white',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  subTabItem: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  subTabActive: {},
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#A556BE'
  },
  concursoSelectorRow: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD'
  },
  concursoLabel: { fontSize: 18, fontWeight: 'bold', color: '#000', marginRight: 15 },
  concursoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    width: 180,
    justifyContent: 'space-between',
    height: 44
  },
  arrowBtn: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRightWidth: 1,
    borderRightColor: '#EEE'
  },
  arrowBtnRight: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderLeftWidth: 1,
    borderLeftColor: '#EEE'
  },
  concursoInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    height: '100%'
  },
  searchBtn: {
    backgroundColor: '#5D2E7A',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  content: { flex: 1, padding: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16, marginTop: 15, marginBottom: 20 },
  createBtn: { backgroundColor: '#A556BE', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 4 },
  createBtnText: { color: '#FFF', fontWeight: 'bold' },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center'
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6A2A88',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  }
});
