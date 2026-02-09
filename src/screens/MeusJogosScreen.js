import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../constants/colors';
import NumerosBola from '../components/lotofacil/NumerosBola';
import { useJogos } from '../store/JogosContext';

export default function MeusJogosScreen({ navigation }) {
  const { jogos, loading, removerJogo } = useJogos();
  const [jogoExpandido, setJogoExpandido] = useState(null);

  const confirmarExclusao = (jogo) => {
    Alert.alert(
      'Excluir Jogo',
      `Deseja realmente excluir "${jogo.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removerJogo(jogo.id),
        },
      ]
    );
  };

  const toggleExpandir = (jogoId) => {
    setJogoExpandido(jogoExpandido === jogoId ? null : jogoId);
  };

  const getCorQualidade = (qualidade) => {
    if (!qualidade) return colors.textSecondary;
    if (qualidade >= 90) return '#10b981';
    if (qualidade >= 80) return '#3b82f6';
    if (qualidade >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'Data desconhecida';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando jogos...</Text>
      </View>
    );
  }

  if (jogos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💾</Text>
        <Text style={styles.emptyTitle}>Nenhum jogo salvo</Text>
        <Text style={styles.emptySubtitle}>
          Vá para o Gerador e salve seus jogos favoritos!
        </Text>
      </View>
    );
  }

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
          <Text style={styles.title}>💾 Meus Jogos</Text>
          <Text style={styles.subtitle}>
            {jogos.length} {jogos.length === 1 ? 'jogo salvo' : 'jogos salvos'}
          </Text>
        </View>
      </View>

      {/* Lista de Jogos */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {jogos.map((jogo) => {
          const expandido = jogoExpandido === jogo.id;

          return (
            <View key={jogo.id} style={styles.jogoCard}>
              {/* Header do Card */}
              <TouchableOpacity
                style={styles.jogoHeader}
                onPress={() => toggleExpandir(jogo.id)}
              >
                <View style={styles.jogoHeaderLeft}>
                  <Text style={styles.jogoNome}>{jogo.nome}</Text>
                  <Text style={styles.jogoData}>
                    {formatarData(jogo.dataCriacao)}
                  </Text>
                </View>

                <View style={styles.jogoHeaderRight}>
                  {jogo.qualidade && (
                    <View
                      style={[
                        styles.qualidadeBadge,
                        { backgroundColor: getCorQualidade(jogo.qualidade) },
                      ]}
                    >
                      <Text style={styles.qualidadeText}>{jogo.qualidade}</Text>
                    </View>
                  )}
                  <Text style={styles.expandIcon}>{expandido ? '▼' : '▶'}</Text>
                </View>
              </TouchableOpacity>

              {/* Prévia dos Números (sempre visível) */}
              <View style={styles.numerosPrevia}>
                {jogo.numeros.slice(0, 10).map((num) => (
                  <View key={num} style={styles.numeroMini}>
                    <Text style={styles.numeroMiniText}>
                      {num.toString().padStart(2, '0')}
                    </Text>
                  </View>
                ))}
                {jogo.numeros.length > 10 && (
                  <View style={styles.numeroMini}>
                    <Text style={styles.numeroMiniText}>+{jogo.numeros.length - 10}</Text>
                  </View>
                )}
              </View>

              {/* Conteúdo Expandido */}
              {expandido && (
                <View style={styles.jogoExpandido}>
                  {/* Todos os Números */}
                  <View style={styles.numerosCompleto}>
                    {jogo.numeros.map((num) => (
                      <NumerosBola
                        key={num}
                        numero={num}
                        selecionado={true}
                        tipo={num % 2 === 0 ? 'par' : 'impar'}
                        tamanho="pequeno"
                      />
                    ))}
                  </View>

                  {/* Análise (se existir) */}
                  {jogo.analise && (
                    <View style={styles.analiseContainer}>
                      <Text style={styles.analiseTitle}>📊 Análise</Text>
                      <View style={styles.analiseGrid}>
                        <View style={styles.analiseItem}>
                          <Text style={styles.analiseLabel}>Pares</Text>
                          <Text style={styles.analiseValor}>{jogo.analise.pares}</Text>
                        </View>
                        <View style={styles.analiseItem}>
                          <Text style={styles.analiseLabel}>Ímpares</Text>
                          <Text style={styles.analiseValor}>
                            {15 - jogo.analise.pares}
                          </Text>
                        </View>
                        <View style={styles.analiseItem}>
                          <Text style={styles.analiseLabel}>Primos</Text>
                          <Text style={styles.analiseValor}>{jogo.analise.primos}</Text>
                        </View>
                        <View style={styles.analiseItem}>
                          <Text style={styles.analiseLabel}>Fibonacci</Text>
                          <Text style={styles.analiseValor}>
                            {jogo.analise.fibonacci}
                          </Text>
                        </View>
                        <View style={styles.analiseItem}>
                          <Text style={styles.analiseLabel}>Sequências</Text>
                          <Text style={styles.analiseValor}>
                            {jogo.analise.sequencias}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Estratégia */}
                  {jogo.estrategia && (
                    <View style={styles.estrategiaContainer}>
                      <Text style={styles.estrategiaLabel}>Estratégia:</Text>
                      <Text style={styles.estrategiaValor}>{jogo.estrategia}</Text>
                    </View>
                  )}

                  {/* Botão Excluir */}
                  <TouchableOpacity
                    style={styles.excluirBtn}
                    onPress={() => confirmarExclusao(jogo)}
                  >
                    <Text style={styles.excluirBtnText}>🗑️ Excluir Jogo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
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
  content: {
    flex: 1,
    padding: 16,
  },
  jogoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  jogoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  jogoHeaderLeft: {
    flex: 1,
  },
  jogoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  jogoData: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  jogoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qualidadeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qualidadeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  numerosPrevia: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  jogoExpandido: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
  },
  numerosCompleto: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  analiseContainer: {
    backgroundColor: colors.bgDark,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  analiseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  analiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analiseItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 8,
  },
  analiseLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  analiseValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  estrategiaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  estrategiaLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  estrategiaValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  excluirBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  excluirBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});