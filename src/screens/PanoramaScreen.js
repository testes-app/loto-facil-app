import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LotofacilAPI from '../services/LotofacilAPI';

const BUNDLED_DATA = {
    17: require('../data/resultados/top10_17dezenas_3618concursos.json'),
    18: require('../data/resultados/top10_18dezenas_3618concursos.json'),
    19: require('../data/resultados/top10_19dezenas_3618concursos.json'),
    20: require('../data/resultados/top10_20dezenas_3618concursos.json'),
};

export default function PanoramaScreen() {
    const [filtro, setFiltro] = useState('todos');
    const [dadosDinamicos, setDadosDinamicos] = useState(BUNDLED_DATA);
    const [baseConcursos, setBaseConcursos] = useState(3618);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        carregarDadosRemotos();
    }, []);

    const carregarDadosRemotos = async () => {
        setCarregando(true);
        try {
            const res = await LotofacilAPI.buscarUltimosResultados(1);
            if (res && res.length > 0) {
                const concursoAPI = res[0].concurso;
                const novosDados = { ...BUNDLED_DATA };
                let maiorBase = 3618;

                for (const d of [17, 18, 19, 20]) {
                    for (let c = concursoAPI; c > 3618; c--) {
                        const remoto = await LotofacilAPI.fetchRemoteRankings(c, d);
                        if (remoto) {
                            novosDados[d] = remoto;
                            if (c > maiorBase) maiorBase = c;
                            break;
                        }
                    }
                }
                setDadosDinamicos(novosDados);
                setBaseConcursos(maiorBase);
            }
        } catch (error) {
            console.log('Erro ao carregar panorama remoto:', error);
        }
        setCarregando(false);
    };

    const processData = (raw, type, label) => {
        return raw.map((item, index) => {
            const atraso = item.atraso ?? 0;
            let status = 'ok';
            if (atraso >= 5) status = 'urgente';
            else if (atraso >= 1) status = 'atencao';

            return {
                ...item,
                type,
                categoryLabel: label,
                pos: `#${index + 1}`,
                status,
                atraso: atraso
            };
        });
    };

    const allData = [
        ...processData(dadosDinamicos[17], '17', '17 Dezenas'),
        ...processData(dadosDinamicos[18], '18', '18 Dezenas'),
        ...processData(dadosDinamicos[19], '19', '19 Dezenas'),
        ...processData(dadosDinamicos[20], '20', '20 Dezenas'),
    ];

    const filteredData = allData.filter(item => {
        if (filtro === 'todos') return true;
        if (['urgente', 'atencao', 'ok'].includes(filtro)) return item.status === filtro;
        return item.type === filtro;
    }).sort((a, b) => b.atraso - a.atraso);

    // Grouping
    const groups = {};
    filteredData.forEach(item => {
        if (!groups[item.categoryLabel]) groups[item.categoryLabel] = [];
        groups[item.categoryLabel].push(item);
    });

    const renderBadge = (item) => {
        const config = {
            urgente: { bg: 'rgba(244,63,94,0.2)', color: '#F87171', border: 'rgba(244,63,94,0.3)', label: `🔴 ATRASO ${item.atraso}` },
            atencao: { bg: 'rgba(251,191,36,0.15)', color: '#FCD34D', border: 'rgba(251,191,36,0.3)', label: `🟡 ATRASO ${item.atraso}` },
            ok: { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', border: 'rgba(16,185,129,0.25)', label: '🟢 EM DIA' },
        };
        const c = config[item.status];
        return (
            <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
                <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerLogo}>LOTOMATRIX</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.headerTitle}>📊 Painel Geral</Text>
                    {carregando ? (
                        <ActivityIndicator size="small" color="#A78BFA" />
                    ) : (
                        <TouchableOpacity onPress={carregarDadosRemotos}>
                            <Ionicons name="refresh" size={18} color="#A78BFA" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.headerSub}>TOP COMBINAÇÕES · BASE: {baseConcursos} CONCURSOS</Text>
            </View>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setFiltro(cat.id)}
                            style={[styles.tab, filtro === cat.id && styles.tabActive]}
                        >
                            <Text style={[styles.tabText, filtro === cat.id && styles.tabTextActive]}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#F43F5E' }]} />
                    <Text style={styles.legendText}>URGENTE ≥5</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#FBBF24' }]} />
                    <Text style={styles.legendText}>ATENÇÃO 1-4</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>EM DIA = 0</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                {Object.keys(groups).length === 0 ? (
                    <Text style={styles.empty}>Nenhuma combinação encontrada.</Text>
                ) : (
                    Object.entries(groups).map(([title, items]) => (
                        <View key={title} style={styles.secao}>
                            <View style={styles.secaoHeader}>
                                <Ionicons name="target" size={14} color="#A78BFA" />
                                <Text style={styles.secaoTitle}>{title.toUpperCase()}</Text>
                                <Text style={styles.secaoCount}>{items.length} combin.</Text>
                            </View>
                            <View style={styles.secaoBody}>
                                {items.map((item, idx) => (
                                    <View key={idx} style={[styles.card, item.status === 'urgente' && styles.cardUrgente, item.status === 'atencao' && styles.cardAtencao, item.status === 'ok' && styles.cardOk]}>
                                        <Text style={styles.posicao}>{item.pos}</Text>
                                        <View style={styles.info}>
                                            <View style={styles.dezenas}>
                                                {item.dezenas.map((n, i) => (
                                                    <View key={i} style={[styles.bolinha, item.atraso >= 7 && { backgroundColor: '#F43F5E' }]}>
                                                        <Text style={styles.bolinhaText}>{String(n).padStart(2, '0')}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                            <View style={styles.meta}>
                                                {renderBadge(item)}
                                                <Text style={styles.score}>score {item.counts['11'] + item.counts['12'] + item.counts['13']}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 40 }} />
                <Text style={styles.footer}>LOTOMATRIX · ANÁLISE ESTATÍSTICA · v2.0</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0E0B1A' },
    header: {
        backgroundColor: '#1A0A3B', padding: 20,
        alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.25)'
    },
    headerLogo: { color: '#A78BFA', fontSize: 10, letterSpacing: 4, marginBottom: 4, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
    headerSub: { color: '#7A6A9A', fontSize: 10, marginTop: 4, letterSpacing: 1 },
    tabsContainer: { backgroundColor: '#1A1530', borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.25)' },
    tabs: { padding: 10, gap: 6 },
    tab: {
        paddingHorizontal: 16, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)'
    },
    tabActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
    tabText: { color: '#7A6A9A', fontSize: 11, fontWeight: 'bold' },
    tabTextActive: { color: '#fff' },
    legend: { flexDirection: 'row', justifyContent: 'center', gap: 12, padding: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { color: '#7A6A9A', fontSize: 9, fontWeight: 'bold' },
    content: { flex: 1, padding: 12 },
    secao: { marginBottom: 20 },
    secaoHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        padding: 10, backgroundColor: '#231C40',
        borderTopLeftRadius: 10, borderTopRightRadius: 10,
        borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(124,58,237,0.25)'
    },
    secaoTitle: { color: '#A78BFA', fontSize: 13, fontWeight: 'bold', flex: 1 },
    secaoCount: { color: '#7A6A9A', fontSize: 10 },
    secaoBody: {
        backgroundColor: '#1A1530', borderRadius: 0,
        borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
        borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', overflow: 'hidden'
    },
    card: {
        padding: 12, flexDirection: 'row', gap: 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.1)',
        borderLeftWidth: 4, borderLeftColor: 'transparent'
    },
    cardUrgente: { borderLeftColor: '#F43F5E' },
    cardAtencao: { borderLeftColor: '#FBBF24' },
    cardOk: { borderLeftColor: '#10B981' },
    posicao: { color: '#A78BFA', fontSize: 14, fontWeight: '800', width: 28 },
    info: { flex: 1 },
    dezenas: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
    bolinha: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center'
    },
    bolinhaText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    badge: {
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 8, borderWidth: 1
    },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    score: { color: '#7A6A9A', fontSize: 10 },
    empty: { color: '#7A6A9A', textAlign: 'center', marginTop: 20 },
    footer: { textAlign: 'center', color: '#7A6A9A', fontSize: 10, letterSpacing: 2 },
});
