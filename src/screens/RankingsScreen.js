import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import LotofacilAPI from '../services/LotofacilAPI';

const DEZENAS = [17, 18, 19, 20];

// Fallback data (bundled) - Mantendo 3619 como base fixa para evitar crashes em builds antigas
const BUNDLED_DATA = {
    17: require('../data/resultados/top10_17dezenas_3619concursos.json'),
    18: require('../data/resultados/top10_18dezenas_3619concursos.json'),
    19: require('../data/resultados/top10_19dezenas_3619concursos.json'),
    20: require('../data/resultados/top10_20dezenas_3619concursos.json'),
};

export default function RankingsScreen() {
    const [dezenasSelecionadas, setDezenasSelecionadas] = useState(17);
    const [urgentes, setUrgentes] = useState(false);
    const [ultimoSorteio, setUltimoSorteio] = useState(null);
    const [dadosDinamicos, setDadosDinamicos] = useState(BUNDLED_DATA);
    const [baseConcursos, setBaseConcursos] = useState(3619);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        carregarDadosRemotos();
    }, []);

    const carregarDadosRemotos = async (forcarAtualizacao = false) => {
        setCarregando(true);
        try {
            // Se for atualização manual, limpar cache para buscar dados frescos
            if (forcarAtualizacao) {
                await LotofacilAPI.clearRankingsCache();
            }

            // 1. Pegar o último concurso oficial
            const res = await LotofacilAPI.buscarUltimosResultados(1);
            if (res && res.length > 0) {
                const ultimo = res[0];
                setUltimoSorteio(ultimo);
                const concursoAPI = ultimo.concurso;

                // 2. Tentar buscar rankings para o concurso atual e até 5 anteriores
                const novosDados = { ...BUNDLED_DATA };
                let maiorBaseEncontrada = 3619;

                for (const d of DEZENAS) {
                    let encontrou = false;
                    // Tentar do mais recente para trás (até 10 concursos antes)
                    for (let c = concursoAPI; c > Math.max(3619, concursoAPI - 10); c--) {
                        const remoto = await LotofacilAPI.fetchRemoteRankings(c, d);
                        if (remoto) {
                            novosDados[d] = remoto;
                            if (c > maiorBaseEncontrada) maiorBaseEncontrada = c;
                            encontrou = true;
                            break;
                        }
                    }
                    if (!encontrou) {
                        console.log(`Não encontrou ranking remoto para ${d} dezenas`);
                    }
                }

                setDadosDinamicos(novosDados);
                setBaseConcursos(maiorBaseEncontrada);
            }
        } catch (error) {
            console.log('Erro ao carregar rankings remotos:', error);
        }
        setCarregando(false);
    };

    const calcularAcertos = (dezenas) => {
        if (!ultimoSorteio || !ultimoSorteio.dezenas) return null;
        const setUltimo = new Set(ultimoSorteio.dezenas.map(n => parseInt(n)));
        return dezenas.filter(n => setUltimo.has(parseInt(n))).length;
    };

    const copiarDezenas = async (dezenas) => {
        const texto = dezenas.map(n => n.toString().padStart(2, '0')).join(' ');
        await Clipboard.setStringAsync(texto);
        Alert.alert('Sucesso', 'Dezenas copiadas para a área de transferência!');
    };

    const getDados = () => {
        let dados = dadosDinamicos[dezenasSelecionadas];

        if (urgentes) {
            return [...dados]
                .sort((a, b) => {
                    const atrasoA = a.atraso ?? 0;
                    const atrasoB = b.atraso ?? 0;
                    if (atrasoA !== atrasoB) return atrasoB - atrasoA; // mais atrasado primeiro
                    // empate no atraso → maior acerto no último sorteio primeiro
                    const acertosA = calcularAcertos(a.dezenas) ?? 0;
                    const acertosB = calcularAcertos(b.dezenas) ?? 0;
                    return acertosB - acertosA;
                })
                .slice(0, 10);
        }
        return dados;
    };

    const getMedalColor = (rank) => {
        if (rank === 1) return '#FFD700';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return '#8B5CF6';
    };

    const getAtrasoColor = (atraso) => {
        if (atraso === 0) return '#22C55E';
        if (atraso <= 3) return '#F59E0B';
        return '#EF4444';
    };

    const calcularIntervalos = (counts, total) => {
        return {
            15: counts['15'] > 0 ? (total / counts['15']).toFixed(1) : '—',
            14: counts['14'] > 0 ? (total / counts['14']).toFixed(1) : '—',
            13: counts['13'] > 0 ? (total / counts['13']).toFixed(1) : '—',
            12: counts['12'] > 0 ? (total / counts['12']).toFixed(1) : '—',
            11: counts['11'] > 0 ? (total / counts['11']).toFixed(1) : '—',
        };
    };

    const dados = getDados();

    return (
        <View style={styles.container}>
            {/* Seletor de dezenas */}
            <View style={styles.dezenasContainer}>
                {DEZENAS.map(d => (
                    <TouchableOpacity
                        key={d}
                        style={[styles.dezenaBtn, dezenasSelecionadas === d && styles.dezenaBtnAtivo]}
                        onPress={() => setDezenasSelecionadas(d)}
                    >
                        <Text style={[styles.dezenaBtnTexto, dezenasSelecionadas === d && styles.dezenaBtnTextoAtivo]}>
                            {d} dez
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Filtro Urgentes */}
            <View style={styles.filtroContainer}>
                <TouchableOpacity
                    style={[styles.filtroBtn, urgentes && styles.filtroBtnAtivo]}
                    onPress={() => setUrgentes(!urgentes)}
                >
                    <Ionicons name="flame" size={14} color={urgentes ? '#fff' : '#8B5CF6'} />
                    <Text style={[styles.filtroBtnTexto, urgentes && styles.filtroBtnTextoAtivo]}> Ordenar por Urgentes</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={styles.titulo}>
                                🏆 {urgentes ? 'Mais Atrasados' : 'Rankings'} — {dezenasSelecionadas} Dezenas
                            </Text>
                            <Text style={styles.subtitulo}>Base: {baseConcursos} concursos</Text>
                        </View>
                        {carregando ? (
                            <ActivityIndicator size="small" color="#8B5CF6" />
                        ) : (
                            <TouchableOpacity onPress={() => carregarDadosRemotos(true)}>
                                <Ionicons name="refresh" size={20} color="#8B5CF6" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {dados.map((item, index) => {
                        const rank = index + 1;
                        const isPodium = rank <= 3;
                        const atraso = item.atraso ?? 0;
                        const intervalos = calcularIntervalos(item.counts, baseConcursos);

                        return (
                            <View key={index} style={[styles.rankCard, isPodium && styles.rankCardPodium]}>
                                {/* Header */}
                                <View style={styles.rankHeader}>
                                    <View style={styles.rankLeft}>
                                        <Ionicons
                                            name={rank <= 3 ? 'medal' : 'trophy'}
                                            size={28}
                                            color={getMedalColor(rank)}
                                        />
                                        <Text style={[styles.rankNumber, isPodium && styles.rankNumberPodium]}>
                                            #{rank}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.copyBtn}
                                        onPress={() => copiarDezenas(item.dezenas)}
                                    >
                                        <Ionicons name="copy-outline" size={20} color="#8B5CF6" />
                                        <Text style={styles.copyBtnText}>Copiar</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Atraso badge */}
                                <View style={[styles.atrasoBadge, { backgroundColor: getAtrasoColor(atraso) }]}>
                                    <Text style={styles.atrasoTexto}>
                                        {(() => {
                                            const ultimoConcurso = ultimoSorteio?.concurso ?? baseConcursos;
                                            const concursoSaiu = ultimoConcurso - atraso;
                                            if (atraso === 0) {
                                                const acertos = calcularAcertos(item.dezenas);
                                                return acertos !== null
                                                    ? `⏱ Atraso: 0 — ⭐ ${acertos} acertos | Concurso #${concursoSaiu}`
                                                    : `⏱ Atraso: 0 | Concurso #${concursoSaiu}`;
                                            }
                                            return `⏱ Atraso: ${atraso} ${atraso === 1 ? 'sorteio' : 'sorteios'} | Saiu no #${concursoSaiu}`;
                                        })()}
                                    </Text>
                                </View>

                                {/* Dezenas */}
                                <View style={styles.bolinhasContainer}>
                                    {item.dezenas.map((n, i) => (
                                        <View key={i} style={styles.bolinha}>
                                            <Text style={styles.bolinhaTexto}>{n.toString().padStart(2, '0')}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Tabela */}
                                <View style={styles.tabela}>
                                    <View style={styles.tabelaHeader}>
                                        <Text style={[styles.tabelaCol, styles.tabelaBold]}>Faixa</Text>
                                        <Text style={[styles.tabelaCol, styles.tabelaBold]}>Qtd</Text>
                                        <Text style={[styles.tabelaCol, styles.tabelaBold]}>Intervalo</Text>
                                    </View>
                                    {[15, 14, 13, 12, 11].map(faixa => (
                                        <View key={faixa} style={styles.tabelaLinha}>
                                            <Text style={styles.tabelaCol}>{faixa} acertos</Text>
                                            <Text style={styles.tabelaCol}>{item.counts[faixa] || 0}</Text>
                                            <Text style={styles.tabelaCol}>{intervalos[faixa]}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    dezenasContainer: {
        flexDirection: 'row', justifyContent: 'center',
        padding: 10, gap: 8, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#E0E0E0'
    },
    dezenaBtn: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: '#8B5CF6'
    },
    dezenaBtnAtivo: { backgroundColor: '#8B5CF6' },
    dezenaBtnTexto: { color: '#8B5CF6', fontWeight: '600' },
    dezenaBtnTextoAtivo: { color: '#fff' },
    filtroContainer: {
        flexDirection: 'row', backgroundColor: '#fff',
        paddingHorizontal: 12, paddingVertical: 8, gap: 8,
        borderBottomWidth: 1, borderBottomColor: '#E0E0E0'
    },
    filtroBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', paddingVertical: 10,
        borderRadius: 12, borderWidth: 1, borderColor: '#8B5CF6'
    },
    filtroBtnAtivo: { backgroundColor: '#8B5CF6' },
    filtroBtnTexto: { color: '#8B5CF6', fontWeight: '600', fontSize: 13 },
    filtroBtnTextoAtivo: { color: '#fff' },
    scrollView: { flex: 1 },
    content: { padding: 12 },
    titulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    subtitulo: { fontSize: 12, color: '#999', marginBottom: 12 },
    rankCard: {
        backgroundColor: '#fff', borderRadius: 16,
        padding: 16, marginBottom: 12, elevation: 5,
    },
    rankCardPodium: { borderWidth: 2, borderColor: '#FFD700' },
    rankHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10
    },
    rankLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rankNumber: { fontSize: 20, fontWeight: 'bold', color: '#8B5CF6' },
    rankNumberPodium: { fontSize: 24, color: '#FFD700' },
    scoreContainer: {},
    scoreValue: {},
    atrasoBadge: {
        alignSelf: 'flex-start', paddingHorizontal: 10,
        paddingVertical: 4, borderRadius: 12, marginBottom: 10
    },
    atrasoTexto: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    bolinhasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
    bolinha: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center'
    },
    bolinhaTexto: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    tabela: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
    tabelaHeader: { flexDirection: 'row', marginBottom: 4 },
    tabelaLinha: { flexDirection: 'row', paddingVertical: 2 },
    tabelaCol: { flex: 1, fontSize: 12, color: '#555' },
    tabelaBold: { fontWeight: 'bold', color: '#333' },
    copyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 8, backgroundColor: '#F3E8FF',
    },
    copyBtnText: { color: '#8B5CF6', fontSize: 13, fontWeight: '600' },
});