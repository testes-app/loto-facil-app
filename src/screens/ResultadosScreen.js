import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../constants/colors';
import NumerosBola from '../components/lotofacil/NumerosBola';
import { useResultados } from '../store/ResultadosContext';
import { formatarValor, formatarData } from '../services/lotofacilService';

export default function ResultadosScreen({ navigation }) {
  const {
    ultimoResultado,
    historico,
    loading,
    erro,
    ultimaAtualizacao,
    atualizarResultados,
  } = useResultados();

  const [refreshing, setRefreshing] = useState(false);
  const [resultadoExpandido, setResultadoExpandido] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await atualizarResultados();
    setRefreshing(false);
  };

  const toggleExpandir = (numero) => {
    setResultadoExpandido(resultadoExpandido === numero ? null : numero);
  };

  const formatarTempoAtualizacao = () => {
    if (!ultimaAtualizacao) return 'Nunca';

    const agora = new Date();
    const diff = agora - ultimaAtualizacao;
    const minutos = Math.floor(diff / 60000);

    if (minutos < 1) return 'Agora';
    if (minutos === 1) return 'Há 1 minuto';
    if (minutos < 60) return `Há ${minutos} minutos`;

    const horas = Math.floor(minutos / 60);
    if (horas === 1) return 'Há 1 hora';
    if (horas < 24) return `Há ${horas} horas`;

    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'Há 1 dia';
    return `Há ${dias} dias`;
  };

  if (loading && !ultimoResultado) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Buscando resultados...</Text>
      </View>
    );
  }

  if (erro && !ultimoResultado) {
    return (
      <View style={styles.erroContainer}>
        <Text style={styles.erroIcon}>⚠️</Text>
        <Text style={styles.erroTitle}>Erro ao carregar</Text>
        <Text style={styles.erroText}>{erro}</Text>
        <TouchableOpacity style={styles.tentarBtn} onPress={atualizarResultados}>
          <Text style={styles.tentarBtnText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>🎲 Resultados</Text>
            <Text style={styles.subtitle}>
              Atualizado {formatarTempoAtualizacao()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.atualizarBtn}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Text style={styles.atualizarBtnText}>
            {refreshing ? '⏳' : '🔄'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Último Resultado */}
        {ultimoResultado && (
          <View style={styles.ultimoContainer}>
            <View style={styles.ultimoHeader}>
              <View>
                <Text style={styles.ultimoLabel}>Último Concurso</Text>
                <Text style={styles.ultimoNumero}>
                  Nº {ultimoResultado.numero}
                </Text>
                <Text style={styles.ultimoData}>
                  {formatarData(ultimoResultado.data)}
                </Text>
              </View>
            </View>

            {/* Números Sorteados */}
            <View style={styles.numerosContainer}>
              {ultimoResultado.numeros.map((num) => (
                <NumerosBola
                  key={num}
                  numero={num}
                  selecionado={true}
                  tipo="default"
                  tamanho="medio"
                />
              ))}
            </View>

            {/* Prêmios */}
            <View style={styles.premiosContainer}>
              <Text style={styles.premiosTitle}>💰 Premiação</Text>

              {/* 15 Acertos */}
              <View style={styles.premioItem}>
                <View style={styles.premioInfo}>
                  <Text style={styles.premioAcertos}>15 acertos</Text>
                  <Text style={styles.premioGanhadores}>
                    {ultimoResultado.premios.acertos15.ganhadores} ganhador(es)
                  </Text>
                </View>
                <Text style={styles.premioValor}>
                  {formatarValor(ultimoResultado.premios.acertos15.valorPremio)}
                </Text>
              </View>

              {/* 14 Acertos */}
              <View style={styles.premioItem}>
                <View style={styles.premioInfo}>
                  <Text style={styles.premioAcertos}>14 acertos</Text>
                  <Text style={styles.premioGanhadores}>
                    {ultimoResultado.premios.acertos14.ganhadores} ganhador(es)
                  </Text>
                </View>
                <Text style={styles.premioValor}>
                  {formatarValor(ultimoResultado.premios.acertos14.valorPremio)}
                </Text>
              </View>

              {/* 13 Acertos */}
              <View style={styles.premioItem}>
                <View style={styles.premioInfo}>
                  <Text style={styles.premioAcertos}>13 acertos</Text>
                  <Text style={styles.premioGanhadores}>
                    {ultimoResultado.premios.acertos13.ganhadores} ganhador(es)
                  </Text>
                </View>
                <Text style={styles.premioValor}>
                  {formatarValor(ultimoResultado.premios.acertos13.valorPremio)}
                </Text>
              </View>

              {/* 12 Acertos */}
              <View style={styles.premioItem}>
                <View style={styles.premioInfo}>
                  <Text style={styles.premioAcertos}>12 acertos</Text>
                  <Text style={styles.premioGanhadores}>
                    {ultimoResultado.premios.acertos12.ganhadores} ganhador(es)
                  </Text>
                </View>
                <Text style={styles.premioValor}>
                  {formatarValor(ultimoResultado.premios.acertos12.valorPremio)}
                </Text>
              </View>

              {/* 11 Acertos */}
              <View style={styles.premioItem}>
                <View style={styles.premioInfo}>
                  <Text style={styles.premioAcertos}>11 acertos</Text>
                  <Text style={styles.premioGanhadores}>
                    {ultimoResultado.premios.acertos11.ganhadores} ganhador(es)
                  </Text>
                </View>
                <Text style={styles.premioValor}>
                  {formatarValor(ultimoResultado.premios.acertos11.valorPremio)}
                </Text>
              </View>
            </View>

            {/* Próximo Concurso */}
            {ultimoResultado.proximoConcurso && (
              <View style={styles.proximoContainer}>
                <Text style={styles.proximoTitle}>🎯 Próximo Concurso</Text>
                <View style={styles.proximoInfo}>
                  <View>
                    <Text style={styles.proximoNumero}>
                      Nº {ultimoResultado.proximoConcurso.numero}
                    </Text>
                    <Text style={styles.proximoData}>
                      {formatarData(ultimoResultado.proximoConcurso.data)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.proximoValorLabel}>Estimativa</Text>
                    <Text style={styles.proximoValor}>
                      {formatarValor(ultimoResultado.proximoConcurso.valorEstimado)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Histórico */}
        {historico.length > 0 && (
          <View style={styles.historicoContainer}>
            <Text style={styles.historicoTitle}>
              📊 Histórico ({historico.length} concursos)
            </Text>

            {historico.map((resultado) => {
              const expandido = resultadoExpandido === resultado.numero;

              return (
                <TouchableOpacity
                  key={resultado.numero}
                  style={styles.historicoCard}
                  onPress={() => toggleExpandir(resultado.numero)}
                >
                  <View style={styles.historicoHeader}>
                    <View>
                      <Text style={styles.historicoConcurso}>
                        Concurso {resultado.numero}
                      </Text>
                      <Text style={styles.historicoData}>
                        {formatarData(resultado.data)}
                      </Text>
                    </View>
                    <Text style={styles.expandIcon}>
                      {expandido ? '▼' : '▶'}
                    </Text>
                  </View>

                  {/* Prévia dos Números */}
                  <View style={styles.numerosPrevia}>
                    {resultado.numeros.map((num) => (
                      <View key={num} style={styles.numeroMini}>
                        <Text style={styles.numeroMiniText}>
                          {num.toString().padStart(2, '0')}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Detalhes Expandidos */}
                  {expandido && (
                    <View style={styles.historicoDetalhes}>
                      <Text style={styles.detalhesTitle}>Premiação Principal</Text>
                      <Text style={styles.detalhesText}>
                        15 acertos: {resultado.premios.acertos15.ganhadores} ganhador(es) •{' '}
                        {formatarValor(resultado.premios.acertos15.valorPremio)}
                      </Text>
                      <Text style={styles.detalhesText}>
                        14 acertos: {resultado.premios.acertos14.ganhadores} ganhador(es) •{' '}
                        {formatarValor(resultado.premios.acertos14.valorPremio)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
  erroContainer: {
    flex: 1,
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  erroIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  erroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  erroText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tentarBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tentarBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  atualizarBtn: {
    padding: 8,
  },
  atualizarBtnText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  ultimoContainer: {
    margin: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  ultimoHeader: {
    marginBottom: 16,
  },
  ultimoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  ultimoNumero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  ultimoData: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  numerosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  premiosContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.bgDark,
    borderRadius: 12,
  },
  premiosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  premioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  premioInfo: {
    flex: 1,
  },
  premioAcertos: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  premioGanhadores: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  premioValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  proximoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.bgDark,
    borderRadius: 12,
  },
  proximoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  proximoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proximoNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  proximoData: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  proximoValorLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  proximoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 4,
  },
  historicoContainer: {
    padding: 16,
  },
  historicoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  historicoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  historicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historicoConcurso: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  historicoData: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  numerosPrevia: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  historicoDetalhes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detalhesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  detalhesText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});