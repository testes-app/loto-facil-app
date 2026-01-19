import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NumerosBolaProps {
  numeros: number[] | string;
  acertos?: number[];
  mostrarAcertos?: boolean;
  tamanho?: number;
  tema?: 'roxo' | 'claro';
}

export const NumerosBola: React.FC<NumerosBolaProps> = ({
  numeros,
  acertos = [],
  mostrarAcertos = false,
  tamanho = 32,
  tema = 'claro'
}) => {
  const listaNumeros = typeof numeros === 'string'
    ? numeros.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n))
    : numeros;

  return (
    <View style={styles.container}>
      {listaNumeros.map((num, idx) => {
        const isAcerto = acertos.includes(num);

        return (
          <View
            key={`${num}-${idx}`}
            style={[
              styles.bolinha,
              { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
              tema === 'roxo' ? styles.bolinhaRoxa : styles.bolinhaClara,
              mostrarAcertos && (isAcerto ? styles.bolinhaAcerto : styles.bolinhaErro)
            ]}
          >
            <Text style={[
              styles.numeroText,
              { fontSize: tamanho * 0.45 },
              tema === 'claro' && !mostrarAcertos && { color: '#333' }
            ]}>
              {num.toString().padStart(2, '0')}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bolinha: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  bolinhaRoxa: {
    backgroundColor: '#7B3F9E',
  },
  bolinhaClara: {
    backgroundColor: '#FFF',
  },
  bolinhaAcerto: {
    backgroundColor: '#7B3F9E',
  },
  bolinhaErro: {
    backgroundColor: '#F0F0F0',
  },
  numeroText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
