import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { JogoCard } from '../../components/JogoCard';
import { deletarJogo, listarJogos } from '../../database/operations';

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

  useFocusEffect(
    useCallback(() => {
      carregarJogos();
    }, [])
  );

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
              carregarJogos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o jogo.');
            }
          },
        },
      ]
    );
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
              <View style={styles.triangle} />
            </View>
            <View style={styles.selectorUnderline} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}><Ionicons name="search-outline" size={26} color="#FFF" /></TouchableOpacity>
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
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/resultados')}>
          <Ionicons name="add" size={28} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/estatisticas')}>
          <Ionicons name="stats-chart" size={28} color="#999" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Meus Jogos</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#A556BE" style={{ marginTop: 50 }} />
        ) : jogos.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Você ainda não salvou nenhum jogo.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(tabs)/resultados')}>
              <Text style={styles.createBtnText}>CRIAR AGORA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jogos.map((jogo) => (
            <JogoCard
              key={jogo.id}
              id={jogo.id}
              nome={jogo.nome}
              numeros={jogo.numeros}
              selecionado={false}
              onPress={() => router.push({ pathname: '/consulta', params: { jogoId: jogo.id } })}
              onDelete={() => handleDeletar(jogo.id)}
            />
          ))
        )}
      </ScrollView>
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
  selectorTextRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{ rotate: '180deg' }],
    marginLeft: 8,
    marginBottom: 4
  },
  selectorUnderline: { width: 35, height: 2, backgroundColor: 'white', opacity: 0.8 },
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
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16, marginTop: 15, marginBottom: 20 },
  createBtn: { backgroundColor: '#A556BE', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 4 },
  createBtnText: { color: '#FFF', fontWeight: 'bold' }
});
