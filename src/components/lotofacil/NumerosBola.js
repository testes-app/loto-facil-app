import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

/**
 * Componente para exibir número em formato de bola
 * Props:
 * - numero: número a ser exibido
 * - selecionado: se está selecionado (boolean)
 * - tipo: 'quente' | 'medio' | 'frio' | 'par' | 'impar' | 'default'
 * - tamanho: 'pequeno' | 'medio' | 'grande'
 * - onPress: função callback ao pressionar
 */
export default function NumerosBola({ 
  numero, 
  selecionado = false, 
  tipo = 'default',
  tamanho = 'medio',
  onPress 
}) {
  // Define cor baseada no tipo
  const getCor = () => {
    if (selecionado) {
      switch(tipo) {
        case 'quente': return colors.numeroQuente;
        case 'medio': return colors.numeroMedio;
        case 'frio': return colors.numeroFrio;
        case 'par': return colors.numeroPar;
        case 'impar': return colors.numeroImpar;
        default: return colors.primary;
      }
    }
    return colors.border;
  };

  // Define tamanho
  const getTamanho = () => {
    switch(tamanho) {
      case 'pequeno': return { width: 40, height: 40, fontSize: 16 };
      case 'grande': return { width: 60, height: 60, fontSize: 22 };
      case 'medio':
      default: return { width: 50, height: 50, fontSize: 18 };
    }
  };

  const size = getTamanho();
  const cor = getCor();

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper 
      style={[
        styles.container, 
        { 
          width: size.width, 
          height: size.height,
          backgroundColor: cor,
          borderColor: selecionado ? cor : colors.border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.numero, 
        { 
          fontSize: size.fontSize,
          color: selecionado ? '#fff' : colors.textSecondary,
        }
      ]}>
        {numero.toString().padStart(2, '0')}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    margin: 4,
  },
  numero: {
    fontWeight: 'bold',
  },
});
