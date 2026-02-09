import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useJogos } from '../store/JogosContext';
import { useResultados } from '../store/ResultadosContext';

export default function HomeScreen({ navigation }) {
  const { jogos } = useJogos();
  const { ultimoResultado } = useResultados();

  const ultimosJogos = (jogos || []).slice(-2).reverse();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎰 LOTO MASTER</Text>
          <Text style={styles.subtitle}>Seu gerador inteligente de Lotofácil</Text>
        </View>

        {/* Resumo Geral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resumo Geral</Text>
          <View style={styles.cardRow}>
            <View style={[styles.card, { backgroundColor: colors.primary }]}>
              <Text style={styles.cardLabel}>Meus Jogos</Text>
              <Text style={styles.cardValue}>{(jogos || []).length}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.blue }]}>
              <Text style={styles.cardLabel}>Último</Text>
              <Text style={styles.cardValue}>{ultimoResultado?.numero || '---'}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.secondary }]}>
              <Text style={styles.cardLabel}>Próximo</Text>
              <Text style={styles.cardValue}>{ultimoResultado?.proximoConcurso?.numero || '---'}</Text>
            </View>
          </View>
        </View>

        {/* Números Quentes (Top 4 das dezenas do último se não houver lógica de estatística centralizada) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Últimas Dezenas</Text>
          <View style={styles.numerosQuentes}>
            {(ultimoResultado?.numeros || [4, 6, 8, 21]).slice(0, 4).map((num) => (
              <View key={num} style={styles.numeroCirculo}>
                <Text style={styles.numeroTexto}>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
          <View style={styles.acoesGrid}>
            <TouchableOpacity
              style={[styles.acaoButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Gerador')}
            >
              <Text style={styles.acaoIcon}>🎲</Text>
              <Text style={styles.acaoTexto}>Gerar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acaoButton, { backgroundColor: colors.blue }]}
              onPress={() => navigation.navigate('Estatisticas')}
            >
              <Text style={styles.acaoIcon}>📊</Text>
              <Text style={styles.acaoTexto}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acaoButton, { backgroundColor: colors.secondary }]}
              onPress={() => navigation.navigate('Analisador')}
            >
              <Text style={styles.acaoIcon}>🤖</Text>
              <Text style={styles.acaoTexto}>IA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acaoButton, { backgroundColor: colors.orange }]}
              onPress={() => navigation.navigate('Conferencia')}
            >
              <Text style={styles.acaoIcon}>✓</Text>
              <Text style={styles.acaoTexto}>Conferir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Últimos Jogos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Últimos Jogos Salvos</Text>
          {ultimosJogos.length > 0 ? (
            ultimosJogos.map((jogo) => (
              <TouchableOpacity
                key={jogo.id}
                style={styles.jogoItem}
                onPress={() => navigation.navigate('MeusJogos')}
              >
                <Text style={styles.jogoTitulo}>{jogo.nome}</Text>
                <Text style={styles.jogoInfo}>
                  {jogo.numeros.length} números • {new Date(jogo.dataCriacao).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Nenhum jogo salvo ainda.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  cardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  numerosQuentes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  numeroCirculo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numeroTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  acoesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  acaoButton: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  acaoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  acaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  jogoItem: {
    backgroundColor: colors.bgCard,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  jogoTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  jogoInfo: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 5,
  },
});
