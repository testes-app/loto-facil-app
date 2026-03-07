import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LotofacilAPI from '../services/LotofacilAPI';

export default function HomeScreen({ navigation }) {
    const [ultimoResultado, setUltimoResultado] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarUltimo();
    }, []);

    const carregarUltimo = async () => {
        setCarregando(true);
        try {
            const resultados = await LotofacilAPI.buscarUltimosResultados(1);
            if (resultados && resultados.length > 0) {
                setUltimoResultado(resultados[0]);
            }
        } catch (error) {
            console.log('Erro ao carregar:', error);
        }
        setCarregando(false);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                />
                <Text style={styles.headerTitle}>LotoMatrix</Text>
                <Text style={styles.headerSub}>Análise inteligente da Lotofácil</Text>
            </View>

            {/* Último resultado */}
            <View style={styles.card}>
                <Text style={styles.cardTitulo}>📋 Último Resultado</Text>
                {carregando ? (
                    <ActivityIndicator color="#6B46C1" style={{ marginTop: 10 }} />
                ) : ultimoResultado ? (
                    <>
                        <Text style={styles.concurso}>✨ Concurso #{ultimoResultado.concurso}</Text>
                        <Text style={styles.data}>{ultimoResultado.data}</Text>
                        <View style={styles.dezenasContainer}>
                            {ultimoResultado.dezenas && ultimoResultado.dezenas.map((n, i) => (
                                <View key={i} style={styles.bolinha}>
                                    <Text style={styles.bolinhaTexto}>{n}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <Text style={styles.semDados}>Sem dados disponíveis</Text>
                )}
                <TouchableOpacity style={styles.botaoAtualizar} onPress={carregarUltimo}>
                    <Ionicons name="refresh" size={16} color="#fff" />
                    <Text style={styles.botaoTexto}>Atualizar</Text>
                </TouchableOpacity>
            </View>

            {/* Cards de navegação */}
            <View style={styles.grid}>
                <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Rankings')}>
                    <Ionicons name="trophy" size={32} color="#6B46C1" />
                    <Text style={styles.gridTexto}>Rankings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Histórico')}>
                    <Ionicons name="time" size={32} color="#6B46C1" />
                    <Text style={styles.gridTexto}>Histórico</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        backgroundColor: '#6B46C1', padding: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    logo: {
        width: 80, height: 80,
        borderRadius: 20, marginBottom: 16,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)'
    },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
    card: {
        backgroundColor: '#fff', margin: 12,
        borderRadius: 12, padding: 16, elevation: 2
    },
    cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    concurso: { fontSize: 20, fontWeight: 'bold', color: '#6B46C1' },
    data: { fontSize: 13, color: '#999', marginBottom: 10 },
    dezenasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    bolinha: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#6B46C1', justifyContent: 'center', alignItems: 'center'
    },
    bolinhaTexto: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    semDados: { color: '#999', textAlign: 'center', marginVertical: 10 },
    botaoAtualizar: {
        flexDirection: 'row', backgroundColor: '#6B46C1',
        padding: 10, borderRadius: 8, justifyContent: 'center',
        alignItems: 'center', marginTop: 12, gap: 6
    },
    botaoTexto: { color: '#fff', fontWeight: '600' },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap',
        margin: 12, gap: 12
    },
    gridCard: {
        backgroundColor: '#fff', borderRadius: 12,
        padding: 16, alignItems: 'center', elevation: 2,
        width: '47%'
    },
    gridTexto: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#333' },
});