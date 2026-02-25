import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LotofacilAPI from '../services/LotofacilAPI';

const BUNDLED_URGENCIA = {
    17: require('../data/resultados/top10_17dezenas_3619concursos.json'),
    18: require('../data/resultados/top10_18dezenas_3619concursos.json'),
    19: require('../data/resultados/top10_19dezenas_3619concursos.json'),
    20: require('../data/resultados/top10_20dezenas_3619concursos.json'),
};

export default function HomeScreen({ navigation }) {
    const [ultimoResultado, setUltimoResultado] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [urgencias, setUrgencias] = useState([]);
    const [carregandoUrgencias, setCarregandoUrgencias] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const limparCache = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(k => k.startsWith('ranking_'));
            if (cacheKeys.length > 0) {
                await AsyncStorage.multiRemove(cacheKeys);
            }
            Alert.alert("Sucesso", "Cache de rankings excluído!");
            carregarDados();
        } catch (error) {
            Alert.alert("Erro", "Falha ao limpar cache.");
        }
    };

    const carregarDados = async () => {
        setCarregando(true);
        // Fallback imediato: carregar dados locais (v1.3)
        const iniciais = [17, 18, 19, 20].map(dz => {
            const data = BUNDLED_URGENCIA[dz];
            const maisAtrasado = [...data].sort((a, b) => (b.atraso || 0) - (a.atraso || 0))[0];
            return { dezenas: dz, atraso: maisAtrasado.atraso || 0 };
        });
        setUrgencias(iniciais);

        try {
            const resultados = await LotofacilAPI.buscarUltimosResultados(1);
            if (resultados && resultados.length > 0) {
                const ultimo = resultados[0];
                setUltimoResultado(ultimo);
                carregarUrgencias(ultimo.concurso);
            }
        } catch (error) {
            console.log('Erro ao carregar:', error);
        }
        setCarregando(false);
    };

    const carregarUrgencias = async (concurso) => {
        setCarregandoUrgencias(true);
        const novasUrgencias = [];
        const DEZENAS = [17, 18, 19, 20];

        try {
            for (const dz of DEZENAS) {
                // Tenta buscar o ranking remoto
                let data = await LotofacilAPI.fetchRemoteRankings(concurso, dz);

                // Se não achar para o atual, tenta o anterior (fallback)
                if (!data) {
                    data = await LotofacilAPI.fetchRemoteRankings(concurso - 1, dz);
                }

                if (data && data.length > 0) {
                    const maisAtrasado = [...data].sort((a, b) => (b.atraso || 0) - (a.atraso || 0))[0];
                    novasUrgencias.push({
                        dezenas: dz,
                        atraso: maisAtrasado.atraso || 0
                    });
                }
            }
            setUrgencias(novasUrgencias);
        } catch (error) {
            console.log('Erro ao carregar urgencias:', error);
        }
        setCarregandoUrgencias(false);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                />
                <Text style={styles.headerTitle}>LotoMatrix</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.headerSub}>Análise inteligente (v1.5.1-OTA)</Text>
                    <TouchableOpacity onPress={limparCache} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 4 }}>
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
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
                <TouchableOpacity style={styles.botaoAtualizar} onPress={carregarDados}>
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

            {/* Índice de Urgência (Destaques Dinâmicos) */}
            <TouchableOpacity
                style={[styles.card, { backgroundColor: '#FFF5F5', borderColor: '#FEB2B2', borderWidth: 1 }]}
                onPress={() => navigation.navigate('Painel')}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.cardTitulo, { color: '#C53030' }]}>🚨 Índice de Urgência (Destaques)</Text>
                    <Ionicons name="chevron-forward" size={20} color="#C53030" />
                </View>
                <Text style={{ fontSize: 12, color: '#9B2C2C', marginBottom: 12 }}>Os jogos mais atrasados de cada categoria:</Text>

                {carregandoUrgencias ? (
                    <ActivityIndicator color="#C53030" size="small" />
                ) : urgencias.length > 0 ? (
                    urgencias.map(item => (
                        <View key={item.dezenas} style={styles.urgenciaItem}>
                            <View style={styles.urgenciaBadge}>
                                <Text style={styles.urgenciaBadgeTxt}>{item.dezenas} Dez</Text>
                            </View>
                            <Text style={styles.urgenciaAtraso}>
                                <Text style={{ fontWeight: 'bold' }}>{item.atraso}</Text> sorteios sem acertos
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>Carregando dados do servidor...</Text>
                )}
            </TouchableOpacity>
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
    urgenciaItem: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 8, backgroundColor: '#fff',
        padding: 8, borderRadius: 8, elevation: 1
    },
    urgenciaBadge: {
        backgroundColor: '#C53030', paddingHorizontal: 8,
        paddingVertical: 2, borderRadius: 4, marginRight: 10
    },
    urgenciaBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    urgenciaAtraso: { fontSize: 13, color: '#4A5568' },
});