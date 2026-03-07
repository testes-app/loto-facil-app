import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CombinacaoCard({
  combinacao,
  rank,
  onPress,
  isFavorite,
  onToggleFavorite
}) {
  const { dezenas, final_score, caracteristicas, urgencia, pred_ranking, master_ranking } = combinacao;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankNumber}>#{rank}</Text>
          <Text style={styles.scoreText}>
            Score: {(final_score * 100).toFixed(1)}
          </Text>
        </View>

        <TouchableOpacity onPress={onToggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF6B6B' : '#999'}
          />
        </TouchableOpacity>
      </View>

      {/* Dezenas */}
      <View style={styles.dezenasContainer}>
        {dezenas.map((num, index) => (
          <View key={index} style={styles.bolinha}>
            <Text style={styles.bolinhaText}>{num.toString().padStart(2, '0')}</Text>
          </View>
        ))}
      </View>

      {/* Características */}
      <View style={styles.caracteristicas}>
        <View style={styles.caracteristicaItem}>
          <Text style={styles.caracteristicaLabel}>Soma</Text>
          <Text style={styles.caracteristicaValue}>{caracteristicas.soma}</Text>
        </View>
        <View style={styles.caracteristicaItem}>
          <Text style={styles.caracteristicaLabel}>P/I</Text>
          <Text style={styles.caracteristicaValue}>
            {caracteristicas.pares}/{caracteristicas.impares}
          </Text>
        </View>
        <View style={styles.caracteristicaItem}>
          <Text style={styles.caracteristicaLabel}>B/A</Text>
          <Text style={styles.caracteristicaValue}>
            {caracteristicas.baixos}/{caracteristicas.altos}
          </Text>
        </View>
        <View style={styles.caracteristicaItem}>
          <Text style={styles.caracteristicaLabel}>Primos</Text>
          <Text style={styles.caracteristicaValue}>{caracteristicas.primos}</Text>
        </View>
      </View>

      {/* Rodapé com Rankings */}
      <View style={styles.footer}>
        <Text style={styles.urgencia}>{urgencia}</Text>
        <View style={styles.rankings}>
          {pred_ranking && (
            <Text style={styles.rankingText}>T: #{pred_ranking}</Text>
          )}
          {master_ranking && (
            <Text style={styles.rankingText}>H: #{master_ranking}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  dezenasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  bolinha: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bolinhaText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  caracteristicas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginVertical: 8,
  },
  caracteristicaItem: {
    alignItems: 'center',
  },
  caracteristicaLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  caracteristicaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  urgencia: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  rankings: {
    flexDirection: 'row',
    gap: 8,
  },
  rankingText: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});