import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NumerosBola } from './NumerosBola';

interface JogoCardProps {
  id: number;
  nome: string;
  numeros: number[];
  selecionado?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
}

export const JogoCard: React.FC<JogoCardProps> = ({
  id,
  nome,
  numeros,
  selecionado = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, selecionado && styles.cardSelecionado]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.leftSection}>
          <View style={[styles.checkbox, selecionado && styles.checkboxActive]}>
            {selecionado && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.nome}>{nome}</Text>
            <Text style={styles.data}>Associado em 19/01/2026</Text>
          </View>
        </View>

        <View style={styles.statusIcon}>
          <Ionicons name="checkmark-circle" size={24} color="#0D47A1" />
        </View>
      </View>

      <View style={styles.numerosPadding}>
        <NumerosBola numeros={numeros} tema="claro" tamanho={32} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardSelecionado: {
    borderColor: '#A556BE',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#A556BE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#A556BE',
  },
  infoContainer: {
    flex: 1,
  },
  nome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  data: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusIcon: {
    marginLeft: 10,
  },
  numerosPadding: {
    paddingLeft: 32, // Alinha com o início do texto após o checkbox
  }
});
