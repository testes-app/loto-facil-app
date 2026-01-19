import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buscarJogo, obterConferenciaJogo } from '../database/operations';

interface ConcursoDetalhe {
  numero_concurso: number;
  data_sorteio: string;
  numeros_sorteados: number[];
  acertos: number;
}

export default function ConsultaScreen() {
  const router = useRouter();
  const { jogoId, numeros: numerosParam } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [jogoNome, setJogoNome] = useState('Jogo Escolhido');
  const [numerosJogo, setNumerosJogo] = useState<number[]>([]);
  const [resumo, setResumo] = useState<{ [key: number]: number }>({});
  const [detalhes, setDetalhes] = useState<ConcursoDetalhe[]>([]);

  useEffect(() => {
    carregarDados();
  }, [jogoId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      let nums: number[] = [];

      if (jogoId) {
        const jogo = await buscarJogo(Number(jogoId));
        if (jogo) {
          setJogoNome(jogo.nome);
          nums = jogo.numeros;
        }
      } else if (numerosParam) {
        // Fallback caso venha os números direto via string
        nums = (numerosParam as string).split(',').map(Number);
      }

      if (nums.length > 0) {
        setNumerosJogo(nums);
        const data = await obterConferenciaJogo(nums);
        setResumo(data.resumo);
        setDetalhes(data.detalhes);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A556BE" />
        <Text style={styles.loadingText}>Analisando jogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consulta de Jogo</Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CARD DO JOGO ANALISADO */}
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

        {/* TABELA DE RESUMO */}
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>Resumo: acertos/concursos</Text>

          {/* Linha 1: 5 a 8 acertos */}
          <View style={styles.resumoHeaderRow}>
            {[5, 6, 7, 8].map(n => <Text key={n} style={styles.resumoHeaderText}>{n} acertos</Text>)}
          </View>
          <View style={styles.resumoValueRow}>
            {[5, 6, 7, 8].map(n => <Text key={n} style={styles.resumoValueText}>{resumo[n] || 0}</Text>)}
          </View>

          {/* Linha 2: 9 a 12 acertos */}
          <View style={styles.resumoHeaderRow}>
            {[9, 10, 11, 12].map(n => <Text key={n} style={styles.resumoHeaderText}>{n} acertos</Text>)}
          </View>
          <View style={styles.resumoValueRow}>
            {[9, 10, 11, 12].map(n => <Text key={n} style={styles.resumoValueText}>{resumo[n] || 0}</Text>)}
          </View>

          {/* Linha 3: 13 a 15 acertos */}
          <View style={styles.resumoHeaderRow}>
            {[13, 14, 15].map((n, i) => <Text key={n} style={[styles.resumoHeaderText, i === 2 && { flex: 2 }]}>{n} acertos</Text>)}
          </View>
          <View style={styles.resumoValueRow}>
            {[13, 14, 15].map((n, i) => <Text key={n} style={[styles.resumoValueText, i === 2 && { flex: 2, borderRightWidth: 0 }]}>{resumo[n] || 0}</Text>)}
          </View>
        </View>

        {/* LISTA DE CONCURSOS */}
        {detalhes.map((item, idx) => (
          <View key={idx} style={styles.concursoCard}>
            <View style={styles.concursoHeader}>
              <Text style={styles.concursoTitle}>
                Concurso {item.numero_concurso}: {formatDate(item.data_sorteio)}
              </Text>
            </View>

            <View style={styles.concursoBody}>
              <View style={styles.dezenasRow}>
                {item.numeros_sorteados.map((num, i) => {
                  const isAcerto = numerosJogo.includes(num);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.bolinhaConcurso,
                        isAcerto ? styles.bolinhaAcerto : styles.bolinhaErro
                      ]}
                    >
                      <Text style={[styles.bolinhaText, isAcerto ? styles.textAcerto : styles.textErro]}>
                        {num.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.acertosContainer}>
                <Text style={styles.acertosCount}>{item.acertos}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
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
  content: { flex: 1, padding: 10 },

  // CARD JOGO
  jogoCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  jogoNome: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  bolinhasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bolinhaJogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  bolinhaJogoText: { fontSize: 13, fontWeight: 'bold', color: '#333' },

  // RESUMO TABELA
  resumoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  resumoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  resumoHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#6A2A88'
  },
  resumoHeaderText: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: '#FFF4'
  },
  resumoValueRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#6A2A88'
  },
  resumoValueText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: '#EEE'
  },

  // LISTA CONCURSOS
  concursoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  concursoHeader: { marginBottom: 8 },
  concursoTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  concursoBody: { flexDirection: 'row', alignItems: 'center' },
  dezenasRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  bolinhaConcurso: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  bolinhaAcerto: { backgroundColor: '#A556BE' },
  bolinhaErro: { backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#DDD' },
  bolinhaText: { fontSize: 12, fontWeight: 'bold' },
  textAcerto: { color: '#FFF' },
  textErro: { color: '#333' },
  acertosContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5
  },
  acertosCount: { fontSize: 18, fontWeight: 'bold', color: '#000' }
});