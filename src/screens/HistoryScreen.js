import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import LotofacilAPI from '../services/LotofacilAPI';

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarResultados();
  }, []);

  const carregarResultados = async () => {
    try {
      setLoading(true);
      setErro(null);
      const dados = await LotofacilAPI.buscarUltimosResultados(100);
      setResultados(dados);
    } catch (error) {
      setErro('Erro ao carregar resultados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Buscando últimos 100 concursos...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 48 }}>⚠️</Text>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity style={styles.botaoRetentar} onPress={carregarResultados}>
          <Text style={styles.botaoRetentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.headerInfo}>
          <Text style={styles.secaoTitulo}>📜 Últimos {resultados.length} Concursos</Text>
          <TouchableOpacity onPress={carregarResultados}>
            <Ionicons name="refresh" size={22} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {resultados.map((sorteio, idx) => (
          <View key={idx} style={[styles.sorteioCard, idx === 0 && styles.cardDestaque]}>
            <View style={styles.sorteioHeader}>
              <Text style={styles.concurso}>
                {idx === 0 ? '✨ ' : ''}Concurso #{sorteio.concurso}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.data}>{sorteio.data}</Text>
                <TouchableOpacity onPress={() => copiarDezenas(sorteio.dezenas)}>
                  <Ionicons name="copy-outline" size={18} color="#8B5CF6" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.numerosContainer}>
              {sorteio.dezenas.sort((a, b) => a - b).map((num, i) => (
                <View key={i} style={[styles.numeroBox, idx === 0 && styles.numeroBoxDestaque]}>
                  <Text style={idx === 0 ? styles.numeroPreto : styles.numeroBranco}>
                    {String(num).padStart(2, '0')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  loadingText: { marginTop: 16, fontSize: 14, color: '#6B7280', textAlign: 'center' },
  erroTexto: { fontSize: 16, color: '#EF4444', marginVertical: 12, textAlign: 'center' },
  botaoRetentar: { backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  botaoRetentarTexto: { color: 'white', fontSize: 16, fontWeight: '600' },
  headerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  secaoTitulo: { fontSize: 16, fontWeight: '700', color: '#333' },
  sorteioCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, margin: 8, elevation: 2 },
  cardDestaque: { borderWidth: 2, borderColor: '#FFD700' },
  sorteioHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  concurso: { fontSize: 16, fontWeight: '700', color: '#8B5CF6' },
  data: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  numerosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  numeroBox: { width: 34, height: 34, backgroundColor: '#8B5CF6', borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  numeroBoxDestaque: { backgroundColor: '#FFD700' },
  numeroBranco: { fontSize: 12, fontWeight: '700', color: 'white' },
  numeroPreto: { fontSize: 12, fontWeight: '700', color: '#333' },
});