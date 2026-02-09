import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResultados } from '../store/ResultadosContext';
import EstatisticasService from '../services/estatisticasService';

const { width: screenWidth } = Dimensions.get('window');
const BAR_WIDTH = (screenWidth - 60) / 25;

export default function EstatisticasScreen({ navigation }) {
  const { historico, loading, ultimoResultado, atualizarResultados } = useResultados();
  const [refreshing, setRefreshing] = useState(false);

  // Calcula estatísticas avançadas usando o novo service
  const stats = useMemo(() => {
    return EstatisticasService.calcularEstatisticas(historico, 10);
  }, [historico]);

  const onRefresh = async () => {
    setRefreshing(true);
    await atualizarResultados();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return '#e11d48';    // Vermelho vivo
      case 'warm': return '#fb923c';   // Laranja
      case 'neutral': return '#8b5cf6'; // Roxo
      case 'cool': return '#3b82f6';   // Azul
      case 'cold': return '#6366f1';   // Indigo
      default: return '#94a3b8';
    }
  };

  if (loading && stats.concursosAnalizados === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#e11d48" />
        <Text style={styles.loadingText}>Sincronizando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e11d48" />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Dashboard Analítico</Text>
        </View>

        {/* ÚLTIMO RESULTADO - BOLINHAS PREMIUM */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Último Concurso #{ultimoResultado?.numero || '----'}</Text>
          <View style={styles.ballsGrid}>
            {ultimoResultado?.numeros?.map((num) => (
              <View key={`last-${num}`} style={styles.ball}>
                <Text style={styles.ballText}>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* RESUMO GERAL */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, { backgroundColor: '#4f46e5' }]}>
            <Text style={styles.summaryLabel}>TOTAL CONCURSOS</Text>
            <Text style={styles.summaryValue}>{stats.totalConcursos}</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: '#0ea5e9' }]}>
            <Text style={styles.summaryLabel}>ANALISADOS (TOP)</Text>
            <Text style={styles.summaryValue}>{stats.concursosAnalizados}</Text>
          </View>
        </View>

        {/* GRÁFICO DE FREQUÊNCIA - ALTA DENSIDADE (25 BARRAS) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Frequência das 25 Dezenas</Text>
          <View style={styles.chartContainer}>
            {stats.frequencia.map((item) => {
              const maxOcc = Math.max(...stats.frequencia.map(f => f.ocorrencias)) || 1;
              const h = (item.ocorrencias / maxOcc) * 120;
              return (
                <View key={`bar-${item.numero}`} style={styles.barWrapper}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barInner, { height: Math.max(h, 4), backgroundColor: getStatusColor(item.status) }]}>
                      {item.ocorrencias > 0 && (
                        <Text style={styles.barValueText}>{item.ocorrencias}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{item.numeroFormatado}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#e11d48' }]} /><Text style={styles.legendText}>Quente</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.legendText}>Frio</Text></View>
          </View>
        </View>

        {/* DISTRIBUIÇÃO E PARES/ÍMPARES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Equilíbrio e Tendências</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Pares</Text>
              <Text style={styles.statVal}>{stats.paresImpares.pares.percentual}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ímpares</Text>
              <Text style={styles.statVal}>{stats.paresImpares.impares.percentual}%</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Baixos (1-8)</Text>
              <Text style={styles.statVal}>{stats.distribuicao.baixos.percentual}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Médios (9-17)</Text>
              <Text style={styles.statVal}>{stats.distribuicao.medios.percentual}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Altos (18-25)</Text>
              <Text style={styles.statVal}>{stats.distribuicao.altos.percentual}%</Text>
            </View>
          </View>
        </View>

        {/* TOP 5 QUENTES E FRIOS */}
        <View style={styles.row}>
          <View style={[styles.card, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.cardTitle}>🔥 Top 5 Quentes</Text>
            {stats.frequencia.slice(0, 5).map((f, i) => (
              <View key={`hot-${f.numero}`} style={styles.miniRow}>
                <Text style={styles.miniRank}>#{i + 1}</Text>
                <Text style={styles.miniNum}>{f.numeroFormatado}</Text>
                <Text style={styles.miniFreq}>{f.ocorrencias}x</Text>
              </View>
            ))}
          </View>
          <View style={[styles.card, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.cardTitle}>🧊 Top 5 Frios</Text>
            {[...stats.frequencia].reverse().slice(0, 5).map((f, i) => (
              <View key={`cold-${f.numero}`} style={styles.miniRow}>
                <Text style={styles.miniRank}>#{i + 1}</Text>
                <Text style={styles.miniNum}>{f.numeroFormatado}</Text>
                <Text style={styles.miniFreq}>{f.ocorrencias}x</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94a3b8', marginTop: 12 },
  scroll: { padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff' },

  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 15, opacity: 0.9 },

  ballsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  ball: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  ballText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryItem: { width: '48.5%', padding: 15, borderRadius: 18, justifyContent: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 'bold' },
  summaryValue: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 2 },

  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingBottom: 5 },
  barWrapper: { width: BAR_WIDTH, alignItems: 'center' },
  barTrack: { width: BAR_WIDTH - 4, height: 130, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barInner: { width: '100%', borderRadius: 4, alignItems: 'center', paddingTop: 2 },
  barValueText: { color: '#fff', fontSize: 7, fontWeight: 'bold' },
  barLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, marginTop: 6, fontWeight: 'bold' },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 },
  statVal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 12 },

  row: { flexDirection: 'row' },
  miniRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  miniRank: { color: 'rgba(255,255,255,0.4)', fontSize: 10, width: 22 },
  miniNum: { color: '#fff', fontSize: 12, fontWeight: 'bold', width: 25 },
  miniFreq: { color: '#ef4444', fontSize: 12, fontWeight: 'bold', flex: 1, textAlign: 'right' }
});
