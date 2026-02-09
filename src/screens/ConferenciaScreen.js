import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useJogos } from '../store/JogosContext';
import { useResultados } from '../store/ResultadosContext';

export default function ConferenciaScreen() {
  const { jogos } = useJogos();
  const { ultimoResultado } = useResultados();

  // Simulando concurso selecionado se não houver da API
  const defaultConcurso = {
    numero: "3604",
    numeros: [1, 2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 21, 22, 23, 25]
  };
  const selectedResult = ultimoResultado || defaultConcurso;

  const conferirJogo = (jogoNumeros = [], resultadoNumeros = []) => {
    if (!Array.isArray(jogoNumeros) || !Array.isArray(resultadoNumeros)) return 0;
    return jogoNumeros.filter(num => resultadoNumeros.includes(num)).length;
  };

  const renderJogo = ({ item }) => {
    const acertos = conferirJogo(item?.numeros || [], selectedResult?.numeros || []);
    const isPremiado = acertos >= 11;

    return (
      <View style={styles.jogoCard}>
        <View style={styles.jogoHeader}>
          <Text style={styles.jogoName}>{item.nome || 'Jogo sem nome'}</Text>
          <View style={[styles.acertosBadge, { backgroundColor: isPremiado ? colors.primary : colors.border }]}>
            <Text style={styles.acertosText}>{acertos} Acertos</Text>
          </View>
        </View>
        <View style={styles.dezenasRow}>
          {(item?.numeros || []).map((num, idx) => {
            const hit = (selectedResult?.numeros || []).includes(num);
            return (
              <View key={idx} style={[styles.dezenaPequena, { backgroundColor: hit ? colors.primary : colors.bgCard, borderColor: hit ? colors.primary : colors.border, borderWidth: 1 }]}>
                <Text style={[styles.dezenaTextoPequeno, { color: hit ? '#fff' : '#9ca3af' }]}>{num.toString().padStart(2, '0')}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Conferindo contra o Concurso:</Text>
        <Text style={styles.concursoInfo}>{selectedResult.numero}</Text>
      </View>

      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id}
        renderItem={renderJogo}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não tem jogos salvos para conferir.</Text>
            <Text style={styles.emptySubtext}>Crie jogos no Gerador para vê-los aqui.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  header: {
    padding: 20,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  concursoInfo: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  listContent: {
    padding: 15,
  },
  jogoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jogoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  jogoName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acertosBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  acertosText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dezenasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dezenaPequena: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dezenaTextoPequeno: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
