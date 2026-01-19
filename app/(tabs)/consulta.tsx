import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buscarJogo, obterConferenciaJogo } from '../../database/operations';

interface ConcursoDetalhe {
  numero_concurso: number;
  data_sorteio: string;
  numeros_sorteados: number[];
  acertos: number;
}

export default function ConsultaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { jogoId, numeros: numerosParam } = params;

  const [loading, setLoading] = useState(true);
  const [jogoNome, setJogoNome] = useState('Consulta');
  const [numerosJogo, setNumerosJogo] = useState<number[]>([]);
  const [resumo, setResumo] = useState<{ [key: number]: number }>({});
  const [detalhes, setDetalhes] = useState<ConcursoDetalhe[]>([]);
  const [totalConcursosNoDb, setTotalConcursosNoDb] = useState(0);

  // FILTRO
  const [modalVisivel, setModalVisivel] = useState(false);
  const [filtro, setFiltro] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
  }, [jogoId, filtro]);

  const carregarDados = async () => {
    try {
      let nums: number[] = [];

      if (jogoId) {
        const jogo = await buscarJogo(Number(jogoId));
        if (jogo) {
          setJogoNome(jogo.nome);
          nums = jogo.numeros;
        }
      } else if (numerosParam) {
        setJogoNome('Consulta');
        nums = (numerosParam as string).split(',').map(Number);
      }

      if (nums.length > 0) {
        setNumerosJogo([...nums].sort((a, b) => a - b));
        const data = await obterConferenciaJogo(nums, filtro);
        setResumo(data.resumo);
        setDetalhes(data.detalhes);
        setTotalConcursosNoDb(data.totalConcursos);
      }
    } catch (error) {
      console.error('Erro ao carregar consulta:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [ano, mes, dia] = dateStr.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dateStr;
    }
  };

  const handleSelectFiltro = (val: number | null) => {
    setFiltro(val);
    setModalVisivel(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A556BE" />
        <Text style={styles.loadingText}>Processando resultados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER FIXO NO TOPO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consulta de Jogo</Text>
        <TouchableOpacity onPress={() => setModalVisivel(true)}>
          <Ionicons name="filter" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CARD DO JOGO */}
        <View style={styles.jogoCard}>
          <Text style={styles.jogoNome}>{jogoNome}</Text>
          <View style={styles.bolinhasContainer}>
            {numerosJogo.map((num, idx) => (
              <View key={idx} style={styles.bolinhaJogo}>
                <Text style={styles.bolinhaJogoText}>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* RESUMO ACERTOS (CARD ROXO) */}
        <View style={styles.resumoContainer}>
          <View style={styles.resumoHeader}>
            <View style={styles.resumoHeaderLeft}>
              <View style={styles.statsIconBox}>
                <Ionicons name="stats-chart" size={16} color="#FFF" />
              </View>
              <Text style={styles.resumoTitleText}>Resumo de Acertos</Text>
            </View>
            <Text style={styles.resumoCountText}>{totalConcursosNoDb} concursos</Text>
          </View>

          <View style={styles.resumoCardPurple}>
            {[15, 14, 13, 12, 11].map(n => (
              <View key={n} style={styles.resumoBand}>
                <Text style={styles.resumoBandLabel}>{n} acertos:</Text>
                <Text style={styles.resumoBandValue}>{resumo[n] || 0}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* HISTORICO */}
        <Text style={styles.historicoTitle}>Histórico de Concursos</Text>

        {totalConcursosNoDb === 0 ? (
          <View style={styles.avisoBox}>
            <Ionicons name="cloud-download-outline" size={50} color="#CCC" />
            <Text style={styles.avisoText}>Sincronize os dados primeiro para ver o histórico!</Text>
          </View>
        ) : detalhes.length === 0 ? (
          <Text style={styles.noResults}>Nenhum concurso encontrado para {filtro} acertos.</Text>
        ) : (
          detalhes.map((item, idx) => (
            <View key={idx} style={styles.concursoCard}>
              <View style={styles.concursoHeaderCard}>
                <Text style={styles.concursoNumText}>Concurso {item.numero_concurso}</Text>
                <Text style={styles.concursoDateText}>{formatDate(item.data_sorteio)}</Text>
              </View>

              <View style={styles.bolinhasHistRow}>
                {item.numeros_sorteados.map((num, i) => {
                  const isActive = numerosJogo.includes(num);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.bolinhaSmall,
                        isActive ? styles.bolinhaAtiva : styles.bolinhaInativa
                      ]}
                    >
                      <Text style={[styles.bolinhaSmallText, isActive ? { color: '#FFF' } : { color: '#333' }]}>
                        {num.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.concursoFooter}>
                <Text style={styles.acertosDestaque}>{item.acertos} acertos</Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL DE FILTRO */}
      <Modal visible={modalVisivel} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisivel(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione uma Opção</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectFiltro(null)}>
                <Text style={styles.modalOptionText}>Todos</Text>
              </TouchableOpacity>
              {[15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5].map(n => (
                <TouchableOpacity key={n} style={styles.modalOption} onPress={() => handleSelectFiltro(n)}>
                  <Text style={styles.modalOptionText}>{n} acertos</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#A556BE', fontWeight: 'bold' },
  header: {
    height: 60,
    backgroundColor: '#A556BE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 5
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 12 },
  jogoCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 15, elevation: 2 },
  jogoNome: { fontSize: 15, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  bolinhasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bolinhaJogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bolinhaJogoText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  resumoContainer: { backgroundColor: '#FFF', borderRadius: 12, padding: 10, marginBottom: 20, elevation: 2 },
  resumoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resumoHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statsIconBox: { backgroundColor: '#7B3F9E', padding: 4, borderRadius: 4 },
  resumoTitleText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  resumoCountText: { fontSize: 11, color: '#999' },
  resumoCardPurple: { backgroundColor: '#7B3F9E', borderRadius: 8, overflow: 'hidden' },
  resumoBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  resumoBandLabel: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  resumoBandValue: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  historicoTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  concursoCard: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, elevation: 1 },
  concursoHeaderCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  concursoNumText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  concursoDateText: { fontSize: 13, color: '#999' },
  bolinhasHistRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  bolinhaSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  bolinhaAtiva: { backgroundColor: '#7B3F9E', borderColor: '#7B3F9E' },
  bolinhaInativa: { backgroundColor: '#FFF' },
  bolinhaSmallText: { fontSize: 11, fontWeight: 'bold' },
  concursoFooter: { alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 8 },
  acertosDestaque: { fontSize: 15, fontWeight: 'bold', color: '#7B3F9E' },
  noResults: { textAlign: 'center', color: '#999', marginTop: 20 },
  avisoBox: { alignItems: 'center', padding: 40 },
  avisoText: { textAlign: 'center', color: '#999', marginTop: 15, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', maxHeight: '70%', backgroundColor: '#FFF', borderRadius: 8, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalOptionText: { fontSize: 15, color: '#333' }
});
