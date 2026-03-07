import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CombinacaoDetalhesModal({
  visible,
  onClose,
  combinacao,
  rank,
  onShare,
  onCopy
}) {
  if (!combinacao) return null;

  const getUrgenciaColor = (urgencia) => {
    if (urgencia.includes('🔥')) return '#FF6B6B';
    if (urgencia.includes('⚠️')) return '#FF9800';
    if (urgencia.includes('📊')) return '#2196F3';
    return '#4CAF50';
  };

  const getUrgenciaIcon = (urgencia) => {
    if (urgencia.includes('🔥')) return 'flame';
    if (urgencia.includes('⚠️')) return 'warning';
    if (urgencia.includes('📊')) return 'stats-chart';
    return 'checkmark-circle';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.rankBadge}>#{rank}</Text>
                <View>
                  <Text style={styles.title}>Análise Completa</Text>
                  <Text style={styles.scoreText}>
                    Score: {(combinacao.final_score * 100).toFixed(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.urgenciaBadge, { backgroundColor: getUrgenciaColor(combinacao.urgencia) + '20' }]}>
              <Ionicons
                name={getUrgenciaIcon(combinacao.urgencia)}
                size={24}
                color={getUrgenciaColor(combinacao.urgencia)}
              />
              <Text style={[styles.urgenciaText, { color: getUrgenciaColor(combinacao.urgencia) }]}>
                {combinacao.urgencia}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>🔢 Dezenas</Text>
            <View style={styles.dezenasContainer}>
              {combinacao.dezenas.map((num, index) => (
                <View key={index} style={styles.bolinha}>
                  <Text style={styles.bolinhaText}>
                    {num.toString().padStart(2, '0')}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>📊 Características</Text>
            <View style={styles.caracteristicasGrid}>
              <View style={styles.caracteristicaCard}>
                <Ionicons name="calculator" size={20} color="#8B5CF6" />
                <Text style={styles.caracteristicaLabel}>Soma</Text>
                <Text style={styles.caracteristicaValue}>
                  {combinacao.caracteristicas.soma}
                </Text>
              </View>

              <View style={styles.caracteristicaCard}>
                <Ionicons name="git-compare" size={20} color="#8B5CF6" />
                <Text style={styles.caracteristicaLabel}>Pares/Ímpares</Text>
                <Text style={styles.caracteristicaValue}>
                  {combinacao.caracteristicas.pares}/{combinacao.caracteristicas.impares}
                </Text>
              </View>

              <View style={styles.caracteristicaCard}>
                <Ionicons name="swap-vertical" size={20} color="#8B5CF6" />
                <Text style={styles.caracteristicaLabel}>Baixos/Altos</Text>
                <Text style={styles.caracteristicaValue}>
                  {combinacao.caracteristicas.baixos}/{combinacao.caracteristicas.altos}
                </Text>
              </View>

              <View style={styles.caracteristicaCard}>
                <Ionicons name="star" size={20} color="#8B5CF6" />
                <Text style={styles.caracteristicaLabel}>Primos</Text>
                <Text style={styles.caracteristicaValue}>
                  {combinacao.caracteristicas.primos}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>⏱️ Ciclo de Atraso</Text>
            <View style={styles.atrasosContainer}>
              <View style={styles.atrasoItem}>
                <Text style={styles.atrasoLabel}>14 pontos</Text>
                <Text style={styles.atrasoValue}>{combinacao.atraso_14} con</Text>
              </View>
              <View style={styles.atrasoItem}>
                <Text style={styles.atrasoLabel}>13 pontos</Text>
                <Text style={styles.atrasoValue}>{combinacao.atraso_13} con</Text>
              </View>
            </View>

            {(combinacao.pred_ranking || combinacao.master_ranking) && (
              <>
                <Text style={styles.sectionTitle}>🏆 Rankings</Text>
                <View style={styles.rankingsContainer}>
                  {combinacao.pred_ranking && (
                    <View style={styles.rankingCard}>
                      <Ionicons name="trending-up" size={20} color="#8B5CF6" />
                      <Text style={styles.rankingLabel}>Tendência</Text>
                      <Text style={styles.rankingValue}>#{combinacao.pred_ranking}</Text>
                      <Text style={styles.rankingScore}>
                        {combinacao.pred_indice?.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {combinacao.master_ranking && (
                    <View style={styles.rankingCard}>
                      <Ionicons name="bar-chart" size={20} color="#8B5CF6" />
                      <Text style={styles.rankingLabel}>Histórico</Text>
                      <Text style={styles.rankingValue}>#{combinacao.master_ranking}</Text>
                      <Text style={styles.rankingScore}>
                        {combinacao.master_score?.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {combinacao.acertos && (
              <>
                <Text style={styles.sectionTitle}>📈 Histórico de Acertos</Text>
                <View style={styles.acertosContainer}>
                  {Object.entries(combinacao.acertos).map(([pontos, qtd]) => (
                    <View key={pontos} style={styles.acertoItem}>
                      <Text style={styles.acertoLabel}>{pontos} pts</Text>
                      <Text style={styles.acertoValue}>{qtd}x</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.copyButton]}
                onPress={() => onCopy(combinacao, rank)}
              >
                <Ionicons name="copy-outline" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Copiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => onShare(combinacao, rank)}
              >
                <Ionicons name="share-social-outline" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: { fontSize: 32, fontWeight: 'bold', color: '#8B5CF6' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scoreText: { fontSize: 14, color: '#666', marginTop: 2 },
  closeButton: { padding: 4 },
  urgenciaBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 20 },
  urgenciaText: { fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 12 },
  dezenasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bolinha: { backgroundColor: '#8B5CF6', borderRadius: 18, width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  bolinhaText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  caracteristicasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  caracteristicaCard: { flex: 1, minWidth: '45%', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  caracteristicaLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
  caracteristicaValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  atrasosContainer: { flexDirection: 'row', gap: 12 },
  atrasoItem: { flex: 1, backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16, alignItems: 'center' },
  atrasoLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  atrasoValue: { fontSize: 20, fontWeight: 'bold', color: '#FF9800' },
  rankingsContainer: { flexDirection: 'row', gap: 12 },
  rankingCard: { flex: 1, backgroundColor: '#F8F5FF', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  rankingLabel: { fontSize: 11, color: '#666' },
  rankingValue: { fontSize: 18, fontWeight: 'bold', color: '#8B5CF6' },
  rankingScore: { fontSize: 12, color: '#999' },
  acertosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  acertoItem: { backgroundColor: '#E8F5E9', borderRadius: 8, padding: 8, minWidth: 60, alignItems: 'center' },
  acertoLabel: { fontSize: 11, color: '#666' },
  acertoValue: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 10 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  copyButton: { backgroundColor: '#2196F3' },
  shareButton: { backgroundColor: '#8B5CF6' },
  actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});