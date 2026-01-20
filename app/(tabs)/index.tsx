import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NumerosBola } from '../../components/NumerosBola';
import { ConcursoDb, listarConcursos } from '../../database/operations';

export default function ResultadosScreen() {
  const router = useRouter();
  const [ultimoConcurso, setUltimoConcurso] = useState<ConcursoDb | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const dados = await listarConcursos();
      if (dados && dados.length > 0) {
        setUltimoConcurso(dados[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar concurso:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* HEADER SUPERIOR (ROXO CLARO) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity><Ionicons name="chevron-back" size={28} color="#FFF" /></TouchableOpacity>
          <View style={styles.selectorContainer}>
            <View style={styles.selectorTextRow}>
              <Text style={styles.headerTitle}>LF</Text>
              <View style={styles.triangle} />
            </View>
            <View style={styles.selectorUnderline} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity><Ionicons name="arrow-back-outline" size={26} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="ellipsis-vertical" size={26} color="#FFF" style={{ marginLeft: 15 }} /></TouchableOpacity>
        </View>
      </View>

      {/* SUB-HEADER DE ÍCONES (BRANCO) */}
      <View style={styles.subHeader}>
        <TouchableOpacity style={[styles.subTabItem, styles.subTabActive]}>
          <Ionicons name="logo-usd" size={28} color="#A556BE" />
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/meus-jogos')}>
          <Ionicons name="star" size={28} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/resultados')}>
          <Ionicons name="add" size={28} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/estatisticas')}>
          <Ionicons name="stats-chart" size={28} color="#CCC" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionLabel}>Resultado</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#A556BE" style={{ marginTop: 50 }} />
        ) : ultimoConcurso ? (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push({
              pathname: '/resultado-detalhe',
              params: { numero: ultimoConcurso.numero_concurso }
            })}
          >
            <Text style={styles.concursoTexto}>
              Concurso: {ultimoConcurso.numero_concurso} ({new Date(ultimoConcurso.data_sorteio + 'T00:00:00').toLocaleDateString('pt-BR')})
            </Text>
            <View style={styles.ballsWrapper}>
              <NumerosBola numeros={ultimoConcurso.numeros_sorteados} tamanho={33} />
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
        )}
      </ScrollView>

      {/* BOTÃO FLUTUANTE (FAB) ROXO ESCURO */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/(tabs)/resultados')}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
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

  content: { flex: 1 },
  sectionLabel: { padding: 10, fontSize: 16, fontWeight: 'bold', color: '#000' },
  card: {
    backgroundColor: 'white',
    borderRadius: 4,
    marginHorizontal: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  concursoTexto: { fontSize: 17, color: '#333', marginBottom: 12 },
  ballsWrapper: { width: '100%', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },

  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#4B1A63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  }
});