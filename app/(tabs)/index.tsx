import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { salvarJogo } from '../../database/operations';

export default function CriarJogoScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);

  const todosNumeros = Array.from({ length: 25 }, (_, i) => i + 1);

  const toggleNumero = (num: number) => {
    if (numerosSelecionados.includes(num)) {
      setNumerosSelecionados(numerosSelecionados.filter(n => n !== num));
    } else {
      if (numerosSelecionados.length < 20) {
        setNumerosSelecionados([...numerosSelecionados, num].sort((a, b) => a - b));
      } else {
        Alert.alert('Limite', 'Máximo de 20 números.');
      }
    }
  };

  const surpresinha = () => {
    const nums: number[] = [];
    while (nums.length < 15) {
      const r = Math.floor(Math.random() * 25) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setNumerosSelecionados(nums.sort((a, b) => a - b));
  };

  const handleSalvar = async () => {
    if (!nome.trim() || numerosSelecionados.length < 15) {
      Alert.alert('Atenção', 'Informe um nome e escolha pelo menos 15 números.');
      return;
    }
    try {
      await salvarJogo({
        nome: nome.trim(),
        numeros: numerosSelecionados,
        data_criacao: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Sucesso', 'Jogo salvo com sucesso!', [
        { text: 'Ver Meus Jogos', onPress: () => router.push('/meus-jogos') },
        { text: 'OK' }
      ]);
      setNome('');
      setNumerosSelecionados([]);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o jogo.');
    }
  };

  const stats = (() => {
    const p = numerosSelecionados.filter(n => n % 2 === 0).length;
    const primos = numerosSelecionados.filter(n => [2, 3, 5, 7, 11, 13, 17, 19, 23].includes(n)).length;
    const soma = numerosSelecionados.reduce((acc, n) => acc + n, 0);
    return { pares: p, impares: numerosSelecionados.length - p, primos, soma };
  })();

  const getPreco = () => {
    const precos: any = { 15: 3.50, 16: 56.00, 17: 476.00, 18: 2556.00, 19: 13566.00, 20: 54264.00 };
    return precos[numerosSelecionados.length] || 0;
  };

  return (
    <View style={styles.container}>
      {/* NOSSO HEADER PADRÃO */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>LF</Text>
          <Text style={styles.headerArrow}>▼</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={surpresinha}>
            <Ionicons name="dice" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoRow}>
          <Text style={styles.statusText}>Novo Jogo: <Text style={styles.greenText}>{numerosSelecionados.length} dezenas</Text></Text>
          <Text style={styles.priceText}>- R$ {getPreco().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Dê um nome ao seu jogo"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor="#999"
        />

        <View style={styles.statsBar}>
          <Text style={styles.statLabel}>Par: {stats.pares}</Text>
          <Text style={styles.statLabel}>Ímpar: {stats.impares}</Text>
          <Text style={styles.statLabel}>Primo: {stats.primos}</Text>
          <Text style={styles.statLabel}>Soma: {stats.soma}</Text>
        </View>

        <View style={styles.grid}>
          {todosNumeros.map((num) => {
            const isSelected = numerosSelecionados.includes(num);
            return (
              <TouchableOpacity
                key={num}
                style={[styles.ball, isSelected && styles.ballSelected]}
                onPress={() => toggleNumero(num)}
              >
                <Text style={[styles.ballText, isSelected && styles.ballTextSelected]}>
                  {num.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.mainBtn} onPress={handleSalvar}>
          <Text style={styles.mainBtnText}>SALVAR JOGO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={() => setNumerosSelecionados([])}>
          <Text style={styles.clearBtnText}>LIMPAR SELEÇÃO</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { height: 60, backgroundColor: '#7B3F9E', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerArrow: { color: 'white', fontSize: 10, marginLeft: 4, marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { padding: 5 },
  content: { flex: 1, padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 15 },
  statusText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  greenText: { color: '#2ECC71' },
  priceText: { fontSize: 18, color: '#333', marginLeft: 8 },
  input: { backgroundColor: '#F8F8F8', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#EEE', fontSize: 16, marginBottom: 15, color: '#333' },
  statsBar: { backgroundColor: '#5D2E7A', flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderRadius: 10, marginBottom: 20 },
  statLabel: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 30 },
  ball: { width: '17%', aspectRatio: 1, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#DDD', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  ballSelected: { backgroundColor: '#7B3F9E', borderColor: '#7B3F9E' },
  ballText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  ballTextSelected: { color: '#FFF' },
  mainBtn: { backgroundColor: '#7B3F9E', padding: 18, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  clearBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  clearBtnText: { color: '#999', fontWeight: 'bold', fontSize: 14 }
});