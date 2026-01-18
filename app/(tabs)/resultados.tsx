import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NumerosBola } from '../../components/NumerosBola';
import { ConcursoDb, listarConcursos } from '../../database/operations';

export default function ResultadosScreen() {
    const router = useRouter();
    const [ultimoConcurso, setUltimoConcurso] = useState<ConcursoDb | null>(null);
    const [loading, setLoading] = useState(true);

    const carregarDados = async () => {
        try {
            const dados = await listarConcursos();
            if (dados && dados.length > 0) {
                setUltimoConcurso(dados[0]);
            }
        } catch (error) {
            console.error('Erro ao carregar concurso:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [])
    );

    return (
        <View style={styles.container}>
            {/* NOSSO HEADER PADRÃO */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>LF</Text>
                    <Text style={styles.headerArrow}>▼</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}><Ionicons name="grid" size={24} color="#FFF" /></TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}><Ionicons name="dice" size={24} color="#FFF" /></TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}><Ionicons name="thumbs-up" size={24} color="#FFF" /></TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 50 }}>
                <Text style={styles.sectionTitle}>Último Resultado</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#7B3F9E" style={{ marginTop: 50 }} />
                ) : ultimoConcurso ? (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => router.push({
                            pathname: '/resultado-detalhe',
                            params: { numero: ultimoConcurso.numero_concurso }
                        })}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.concursoTexto}>
                                Concurso: {ultimoConcurso.numero_concurso} ({new Date(ultimoConcurso.data_sorteio + 'T00:00:00').toLocaleDateString('pt-BR')})
                            </Text>
                        </View>
                        <View style={styles.ballsContainer}>
                            <NumerosBola numeros={ultimoConcurso.numeros_sorteados} tamanho={32} />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
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
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    headerIcon: { padding: 5 },
    content: { flex: 1 },
    sectionTitle: { padding: 16, fontSize: 18, fontWeight: 'bold', color: '#333' },
    card: { backgroundColor: 'white', borderRadius: 10, marginHorizontal: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: '#EEE' },
    cardHeader: { alignItems: 'center', marginBottom: 15 },
    concursoTexto: { fontSize: 18, color: '#333', fontWeight: 'bold' },
    ballsContainer: { alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});