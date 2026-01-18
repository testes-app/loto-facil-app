import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { buscarConcurso, buscarUltimoConcurso } from '../database/operations';

export default function ConsultaScreen() {
  const [numerosDigitados, setNumerosDigitados] = useState('');
  const [numeroConcurso, setNumeroConcurso] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const consultarResultado = async () => {
    const numeros = numerosDigitados
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => n >= 1 && n <= 25);

    if (numeros.length !== 15) {
      Alert.alert('Erro', 'Digite exatamente 15 números válidos separados por vírgula');
      return;
    }

    setLoading(true);
    try {
      // ✅ OTIMIZADO: Busca apenas 1 concurso específico
      let concursoParaVerificar;

      if (numeroConcurso && numeroConcurso.trim() !== '') {
        const numConcurso = parseInt(numeroConcurso.trim());
        concursoParaVerificar = await buscarConcurso(numConcurso);

        if (!concursoParaVerificar) {
          Alert.alert('Erro', `Concurso ${numConcurso} não encontrado no banco de dados`);
          setLoading(false);
          return;
        }
      } else {
        // Se não especificar, busca o último
        concursoParaVerificar = await buscarUltimoConcurso();

        if (!concursoParaVerificar) {
          Alert.alert('Erro', 'Nenhum concurso encontrado no banco.');
          setLoading(false);
          return;
        }
      }

      const acertos = numeros.filter(n => concursoParaVerificar.numeros_sorteados.includes(n));
      const totalAcertos = acertos.length;

      let premio = 'Sem premiação';
      if (totalAcertos === 15) premio = 'R$ 1.500.000,00 (Estimado)';
      else if (totalAcertos === 14) premio = 'R$ 1.200,00 (Aprox.)';
      else if (totalAcertos === 13) premio = 'R$ 30,00';
      else if (totalAcertos === 12) premio = 'R$ 12,00';
      else if (totalAcertos === 11) premio = 'R$ 6,00';

      setResultado({
        concurso: concursoParaVerificar.numero_concurso,
        numerosGanhadores: concursoParaVerificar.numeros_sorteados,
        acertos: totalAcertos,
        premio: premio
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao consultar concurso');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Consultar Resultado</Text>

        <Text style={styles.label}>Número do Concurso (opcional):</Text>
        <Text style={styles.hint}>(deixe em branco para verificar o último)</Text>
        <TextInput
          style={styles.inputSmall}
          placeholder="Ex: 3585"
          value={numeroConcurso}
          onChangeText={setNumeroConcurso}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Digite os 15 números do seu jogo:</Text>
        <Text style={styles.hint}>(separados por vírgula, ex: 1,2,3,4,5...)</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15"
          value={numerosDigitados}
          onChangeText={setNumerosDigitados}
          keyboardType="numeric"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={consultarResultado}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>🔍 Consultar</Text>
          )}
        </TouchableOpacity>

        {resultado && (
          <View style={styles.resultadoCard}>
            <Text style={styles.resultadoTitle}>📊 Resultado do Concurso {resultado.concurso}</Text>

            <Text style={styles.acertosText}>
              Você acertou: {resultado.acertos} números
            </Text>

            <Text style={styles.premioText}>
              Prêmio: {resultado.premio}
            </Text>

            <View style={styles.numerosContainer}>
              {resultado.numerosGanhadores.map((num: number) => (
                <View key={num} style={styles.bolinha}>
                  <Text style={styles.numeroText}>{num}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ... resto dos styles igual