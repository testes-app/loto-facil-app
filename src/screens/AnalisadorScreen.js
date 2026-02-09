import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useResultados } from '../store/ResultadosContext';
import { useJogos } from '../store/JogosContext';
import { gerarSugestoes } from '../utils/geradorJogos';
import NumerosBola from '../components/lotofacil/NumerosBola';

export default function AnalisadorScreen({ navigation }) {
  const { historico } = useResultados();
  const { adicionarJogo } = useJogos();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const analisar = () => {
    setLoading(true);
    setStrategy(null); // Limpa o jogo anterior para mostrar que está gerando um novo
    // Simula processamento da IA
    setTimeout(() => {
      const sugestoes = gerarSugestoes(1, 'ia', historico);
      const jogo = sugestoes[0];

      setStrategy({
        score: jogo.qualidade,
        tip: `A análise identificou um padrão equilibrado com ${jogo.pares} pares e ${jogo.impares} ímpares, respeitando as tendências dos últimos concursos.`,
        nums: jogo.numeros,
        detalhes: jogo
      });
      setLoading(false);
    }, 1500);
  };

  const salvarJogo = async () => {
    if (!strategy) return;
    try {
      await adicionarJogo({
        numeros: strategy.nums,
        nome: "Sugestão IA",
        estrategia: "IA",
        qualidade: strategy.score
      });
      Alert.alert('Sucesso! 🎉', 'Jogo salvo em "Meus Jogos".');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o jogo.');
    }
  };

  const copiarJogo = () => {
    if (!strategy) return;
    const texto = strategy.nums.map(n => n.toString().padStart(2, '0')).join(', ');
    Clipboard.setString(texto);
    Alert.alert('Copiado!', 'Jogo copiado para a área de transferência.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>🤖 Analisador IA</Text>
            <Text style={styles.subtitle}>Inteligência artificial analisando tendências reais</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, loading && { opacity: 0.7 }]}
          onPress={analisar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🚀 Iniciar Análise Profunda</Text>
          )}
        </TouchableOpacity>

        {strategy && (
          <View style={styles.resultCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Confiança da Estratégia:</Text>
              <Text style={[styles.scoreValue, { color: strategy.score > 80 ? '#10b981' : colors.primary }]}>
                {strategy.score}%
              </Text>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Dica do Algoritmo:</Text>
              <Text style={styles.tipText}>{strategy.tip}</Text>
            </View>

            <View style={styles.numsGrid}>
              <Text style={styles.numsTitle}>Sugestão Otimizada:</Text>
              <View style={styles.dezenasRow}>
                {strategy.nums.map(n => (
                  <NumerosBola
                    key={n}
                    numero={n}
                    selecionado={true}
                    tamanho="pequeno"
                  />
                ))}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={salvarJogo}>
                <Text style={styles.actionBtnText}>💾 Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={copiarJogo}>
                <Text style={styles.actionBtnText}>📋 Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  scroll: { padding: 20 },
  header: {
    marginBottom: 30,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#9ca3af', marginTop: 5 },
  analyzeButton: {
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  scoreLabel: { color: '#fff', fontSize: 16 },
  scoreValue: { fontSize: 22, fontWeight: 'bold' },
  tipBox: { backgroundColor: 'rgba(255,122,0,0.05)', padding: 15, borderRadius: 10, marginBottom: 20 },
  tipTitle: { color: colors.primary, fontWeight: 'bold', marginBottom: 5 },
  tipText: { color: '#e5e7eb', lineHeight: 22 },
  numsGrid: { marginTop: 10 },
  numsTitle: { color: '#9ca3af', marginBottom: 15, fontSize: 13, fontWeight: 'bold' },
  dezenasRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
  actionBtn: { flex: 1, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
