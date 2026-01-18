import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { JogoCard } from '../../components/JogoCard';
import { deletarJogo, listarJogos } from '../../database/operations';

interface Jogo {
  id: number;
  nome: string;
  numeros: number[];
  data_criacao: string;
}

export default function MeusJogosScreen() {
  const router = useRouter();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarJogos();
    }, [])
  );

  const carregarJogos = async () => {
    try {
      const jogosDb = await listarJogos();
      setJogos(jogosDb as Jogo[]);
    } catch (error) {
      console.error('Erro ao listar jogos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    Alert.alert(
      'Deletar Jogo',
      'Tem certeza que deseja excluir este jogo?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarJogo(id);
              carregarJogos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o jogo.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>LF</Text>
          <Text style={styles.headerArrow}>▼</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Meus Jogos</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#7B3F9E" style={{ marginTop: 50 }} />
        ) : jogos.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Você ainda não salvou nenhum jogo.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.createBtnText}>CRIAR AGORA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jogos.map((jogo) => (
            <JogoCard
              key={jogo.id}
              id={jogo.id}
              nome={jogo.nome}
              numeros={jogo.numeros}
              selecionado={false}
              onPress={() => router.push({ pathname: '/consulta', params: { jogoId: jogo.id } })}
              onDelete={() => handleDeletar(jogo.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { height: 60, backgroundColor: '#7B3F9E', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerArrow: { color: 'white', fontSize: 10, marginLeft: 4, marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { padding: 5 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16, marginTop: 15, marginBottom: 20 },
  createBtn: { backgroundColor: '#7B3F9E', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  createBtnText: { color: '#FFF', fontWeight: 'bold' }
});
