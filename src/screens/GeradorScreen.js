import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { colors } from '../constants/colors';
import NumerosBola from '../components/lotofacil/NumerosBola';
import { useJogos } from '../store/JogosContext';
import {
  gerarSugestoes,
  calcularQualidadeJogo,
  contarPares,
  contarPrimos,
  contarFibonacci,
  contarSequencias,
} from '../utils/geradorJogos';

export default function GeradorScreen({ navigation }) {
  const { adicionarJogo } = useJogos();

  const [jogoAtual, setJogoAtual] = useState(null);
  const [sugestoes, setSugestoes] = useState([]);
  const [estrategiaSelecionada, setEstrategiaSelecionada] = useState('misto');
  const [loading, setLoading] = useState(false);
  const [showAnalise, setShowAnalise] = useState(true);

  // Estratégias disponíveis
  const estrategias = [
    { id: 'misto', nome: 'Misto', icon: '🎲', cor: colors.primary },
    { id: 'balanceado', nome: 'Balanceado', icon: '⚖️', cor: '#10b981' },
    { id: 'quentes', nome: 'Quentes', icon: '🔥', cor: '#ef4444' },
    { id: 'frios', nome: 'Frios', icon: '❄️', cor: '#3b82f6' },
    { id: 'ia', nome: 'IA', icon: '🤖', cor: '#8b5cf6' },
  ];

  // Gera sugestões ao montar o componente
  useEffect(() => {
    gerarNovasSugestoes();
  }, []);

  const gerarNovasSugestoes = async () => {
    setLoading(true);

    // Simula delay para melhor UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const novasSugestoes = gerarSugestoes(5, estrategiaSelecionada, null);
    setSugestoes(novasSugestoes);

    // Seleciona o primeiro jogo automaticamente
    if (novasSugestoes.length > 0) {
      setJogoAtual(novasSugestoes[0]);
    }

    setLoading(false);
  };

  const selecionarJogo = (jogo) => {
    setJogoAtual(jogo);
  };

  const salvarJogo = async () => {
    if (!jogoAtual) {
      Alert.alert('Erro', 'Nenhum jogo selecionado!');
      return;
    }

    try {
      await adicionarJogo({
        numeros: jogoAtual.numeros,
        nome: `Jogo ${jogoAtual.tipo}`,
        estrategia: jogoAtual.tipo,
        qualidade: jogoAtual.qualidade,
        analise: {
          pares: jogoAtual.pares,
          primos: jogoAtual.primos,
          fibonacci: jogoAtual.fibonacci,
          sequencias: jogoAtual.sequencias,
        }
      });

      Alert.alert(
        'Sucesso! 🎉',
        'Jogo salvo com sucesso!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o jogo.');
    }
  };

  const copiarJogo = () => {
    if (!jogoAtual) return;
    copiarNumeros(jogoAtual.numeros);
  };

  const copiarNumeros = (numeros) => {
    const texto = numeros.map(n => n.toString().padStart(2, '0')).join(', ');
    Clipboard.setString(texto);
    Alert.alert('Copiado!', 'Jogo copiado para a área de transferência.');
  };
  const getCorQualidade = (qualidade) => {
    if (qualidade >= 90) return '#10b981'; // Verde
    if (qualidade >= 80) return '#3b82f6'; // Azul
    if (qualidade >= 70) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  const getTextoQualidade = (qualidade) => {
    if (qualidade >= 90) return 'EXCELENTE';
    if (qualidade >= 80) return 'MUITO BOM';
    if (qualidade >= 70) return 'BOM';
    if (qualidade >= 60) return 'RAZOÁVEL';
    return 'RUIM';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>🎰 Gerador Inteligente</Text>
          <Text style={styles.subtitle}>Jogos com análise estatística real</Text>
        </View>
      </View>

      {/* Seletor de Estratégia */}
      <View style={styles.estrategiasContainer}>
        <Text style={styles.sectionTitle}>Estratégia</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.estrategiasList}
        >
          {estrategias.map(est => (
            <TouchableOpacity
              key={est.id}
              style={[
                styles.estrategiaBtn,
                estrategiaSelecionada === est.id && {
                  backgroundColor: est.cor,
                  borderColor: est.cor,
                }
              ]}
              onPress={() => setEstrategiaSelecionada(est.id)}
            >
              <Text style={styles.estrategiaIcon}>{est.icon}</Text>
              <Text style={[
                styles.estrategiaNome,
                estrategiaSelecionada === est.id && styles.estrategiaNomeActive
              ]}>
                {est.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Botão Gerar */}
      <TouchableOpacity
        style={styles.gerarBtn}
        onPress={gerarNovasSugestoes}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.gerarBtnText}>⚡ Gerar Novos Jogos</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Conteúdo Principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Jogo Atual */}
        {jogoAtual && (
          <View style={styles.jogoAtualContainer}>
            <View style={styles.jogoAtualHeader}>
              <View>
                <Text style={styles.jogoAtualTipo}>
                  {jogoAtual.tipo}
                </Text>
                <Text style={styles.jogoAtualDesc}>
                  {jogoAtual.descricao}
                </Text>
              </View>
              <View style={[
                styles.qualidadeBadge,
                { backgroundColor: getCorQualidade(jogoAtual.qualidade) }
              ]}>
                <Text style={styles.qualidadeNumero}>{jogoAtual.qualidade}</Text>
                <Text style={styles.qualidadeTexto}>
                  {getTextoQualidade(jogoAtual.qualidade)}
                </Text>
              </View>
            </View>

            {/* Números */}
            <View style={styles.numerosGrid}>
              {jogoAtual.numeros.map((num) => (
                <NumerosBola
                  key={num}
                  numero={num}
                  selecionado={true}
                  tipo={num % 2 === 0 ? 'par' : 'impar'}
                  tamanho="medio"
                />
              ))}
            </View>

            {/* Análise */}
            {showAnalise && (
              <View style={styles.analiseContainer}>
                <TouchableOpacity
                  style={styles.analiseHeader}
                  onPress={() => setShowAnalise(!showAnalise)}
                >
                  <Text style={styles.analiseTitle}>📊 Análise Estatística</Text>
                  <Text style={styles.analiseToggle}>
                    {showAnalise ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.analiseGrid}>
                  <View style={styles.analiseItem}>
                    <Text style={styles.analiseLabel}>Pares</Text>
                    <Text style={styles.analiseValor}>{jogoAtual.pares}</Text>
                  </View>
                  <View style={styles.analiseItem}>
                    <Text style={styles.analiseLabel}>Ímpares</Text>
                    <Text style={styles.analiseValor}>{jogoAtual.impares}</Text>
                  </View>
                  <View style={styles.analiseItem}>
                    <Text style={styles.analiseLabel}>Primos</Text>
                    <Text style={styles.analiseValor}>{jogoAtual.primos}</Text>
                  </View>
                  <View style={styles.analiseItem}>
                    <Text style={styles.analiseLabel}>Fibonacci</Text>
                    <Text style={styles.analiseValor}>{jogoAtual.fibonacci}</Text>
                  </View>
                  <View style={styles.analiseItem}>
                    <Text style={styles.analiseLabel}>Sequências</Text>
                    <Text style={styles.analiseValor}>{jogoAtual.sequencias}</Text>
                  </View>
                  <View style={styles.analiseItem}>
                    <Text style={styles.analiseLabel}>Soma</Text>
                    <Text style={styles.analiseValor}>{jogoAtual.somatorio}</Text>
                  </View>
                </View>

                {/* Distribuição por Linhas */}
                <View style={styles.linhasContainer}>
                  <Text style={styles.linhasTitle}>Distribuição</Text>
                  {Object.entries(jogoAtual.linhas).map(([linha, qtd], index) => (
                    <View key={linha} style={styles.linhaItem}>
                      <Text style={styles.linhaLabel}>
                        Linha {index + 1} ({(index * 5) + 1}-{(index + 1) * 5})
                      </Text>
                      <View style={styles.linhaBar}>
                        <View
                          style={[
                            styles.linhaBarFill,
                            { width: `${(qtd / 15) * 100}%` }
                          ]}
                        />
                        <Text style={styles.linhaQtd}>{qtd}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Botões de Ação */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                onPress={salvarJogo}
              >
                <Text style={styles.actionBtnText}>💾 Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={copiarJogo}
              >
                <Text style={styles.actionBtnText}>📋 Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Outras Sugestões */}
        {sugestoes.length > 1 && (
          <View style={styles.sugestoesContainer}>
            <Text style={styles.sectionTitle}>Outras Sugestões</Text>
            {sugestoes.slice(1).map((jogo) => (
              <TouchableOpacity
                key={jogo.id}
                style={[
                  styles.sugestaoCard,
                  jogoAtual?.id === jogo.id && styles.sugestaoCardActive
                ]}
                onPress={() => selecionarJogo(jogo)}
              >
                <View style={styles.sugestaoHeader}>
                  <View>
                    <Text style={styles.sugestaoTipo}>{jogo.tipo}</Text>
                    <Text style={styles.sugestaoDescMini}>{jogo.descricao}</Text>
                  </View>
                  <View style={styles.sugestaoHeaderRight}>
                    <TouchableOpacity
                      style={styles.miniCopyBtn}
                      onPress={() => copiarNumeros(jogo.numeros)}
                    >
                      <Text style={{ fontSize: 12 }}>📋</Text>
                    </TouchableOpacity>
                    <View style={[
                      styles.sugestaoQualidade,
                      { backgroundColor: getCorQualidade(jogo.qualidade) }
                    ]}>
                      <Text style={styles.sugestaoQualidadeText}>
                        {jogo.qualidade}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.sugestaoNumeros}>
                  {jogo.numeros.map((num) => (
                    <View key={num} style={styles.numeroMini}>
                      <Text style={styles.numeroMiniText}>
                        {num.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.sugestaoAnalise}>
                  <Text style={styles.sugestaoAnaliseText}>
                    P:{jogo.pares} • I:{jogo.impares} • Pr:{jogo.primos} • Seq:{jogo.sequencias}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Espaço inferior */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  estrategiasContainer: {
    padding: 16,
    backgroundColor: colors.bgCard,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  estrategiasList: {
    flexDirection: 'row',
  },
  estrategiaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgDark,
  },
  estrategiaIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  estrategiaNome: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  estrategiaNomeActive: {
    color: '#fff',
  },
  gerarBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gerarBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  jogoAtualContainer: {
    margin: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  jogoAtualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jogoAtualTipo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  jogoAtualDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  qualidadeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  qualidadeNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  qualidadeTexto: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  numerosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  analiseContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  analiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analiseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  analiseToggle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  analiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analiseItem: {
    width: '30%',
    backgroundColor: colors.bgDark,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  analiseLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  analiseValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  linhasContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.bgDark,
    borderRadius: 8,
  },
  linhasTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  linhaItem: {
    marginBottom: 8,
  },
  linhaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  linhaBar: {
    height: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  linhaBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  linhaQtd: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sugestoesContainer: {
    padding: 16,
  },
  sugestaoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  sugestaoCardActive: {
    borderColor: colors.primary,
  },
  sugestaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sugestaoTipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  sugestaoQualidade: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sugestaoQualidadeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sugestaoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCopyBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sugestaoDescMini: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  sugestaoNumeros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  numeroMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  numeroMiniText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  sugestaoAnalise: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sugestaoAnaliseText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});