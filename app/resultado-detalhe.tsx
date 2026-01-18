import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NumerosBola } from '../components/NumerosBola';
import { buscarConcurso } from '../database/operations';

export default function ResultadoDetalheScreen() {
    const { numero } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState<any | null>(null);

    const carregarDados = async () => {
        try {
            const concurso = await buscarConcurso(Number(numero));
            if (concurso) {
                const [ano, mes, dia] = concurso.data_sorteio.split('-');
                const dataFormatada = `${dia}/${mes}/${ano}`;

                setDados({
                    numero: concurso.numero_concurso,
                    dataApuracao: dataFormatada,
                    listaDezenas: concurso.numeros_sorteados,
                    localSorteio: 'SÃO PAULO/SP',
                    valorEstimadoProximoConcurso: 1800000,
                    dataProximoConcurso: '19/01/2026',
                    valorArrecadado: 42195244,
                    valorAcumuladoEspecial: 56102829.68,
                    listaRateio: [
                        { descricao: '15 acertos', numeroDeGanhadores: 2, valorPremio: 3733907.79 },
                        { descricao: '14 acertos', numeroDeGanhadores: 442, valorPremio: 2360.79 },
                        { descricao: '13 acertos', numeroDeGanhadores: 15322, valorPremio: 35.00 },
                        { descricao: '12 acertos', numeroDeGanhadores: 191265, valorPremio: 14.00 },
                        { descricao: '11 acertos', numeroDeGanhadores: 1033801, valorPremio: 7.00 },
                    ],
                    listaMunicipioUFGanhadores: [
                        { municipio: 'XAXIM', uf: 'SC', ganhadores: 1 },
                        { municipio: 'SAO PAULO', uf: 'SP', ganhadores: 1 },
                    ]
                });
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do concurso:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarDados(); }, [numero]);

    // Função para compartilhar
    const compartilharResultado = async () => {
        if (!dados) return;

        const dezenas = dados.listaDezenas.sort((a: number, b: number) => a - b).join(', ');
        const mensagem = `🎰 Lotofácil - Concurso ${dados.numero}\n📅 ${dados.dataApuracao}\n🔢 Dezenas: ${dezenas}\n\nConfira mais detalhes no app!`;

        try {
            await Share.share({
                message: mensagem,
            });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível compartilhar o resultado');
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7B3F9E" />
            </View>
        );
    }

    if (!dados) return null;

    const dezenas = dados.listaDezenas.sort((a: number, b: number) => a - b);
    const par = dezenas.filter(n => n % 2 === 0).length;
    const impar = dezenas.filter(n => n % 2 !== 0).length;
    const primosArr = [2, 3, 5, 7, 11, 13, 17, 19, 23];
    const primo = dezenas.filter(n => primosArr.includes(n)).length;
    const soma = dezenas.reduce((a, b) => a + b, 0);

    const formatCurrency = (val: any) => {
        if (val === undefined || val === null) return 'R$ 0,00';
        const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.')) : val;
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatGanhadores = (num: any) => {
        if (num === undefined || num === null) return '0';
        return Number(num).toLocaleString('pt-BR');
    };

    const listaPremios = dados.listaRateio || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lotofácil</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={compartilharResultado}
                    >
                        <Ionicons name="share-social" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                <View style={styles.content}>
                    <View style={styles.contestHeader}>
                        <Text style={styles.contestNumTitle}>
                            Concurso {dados.numero} ({dados.dataApuracao})
                        </Text>
                        <Text style={styles.contestLocation}>
                            Sorteio realizado em {dados.localSorteio}
                        </Text>
                    </View>

                    <View style={styles.statsPurpleBar}>
                        <Text style={styles.statsBarText}>
                            Par: {par}   |   Ímpar: {impar}   |   Primo: {primo}   |   Soma: {soma}
                        </Text>
                    </View>

                    <View style={styles.ballsContainer}>
                        <NumerosBola numeros={dezenas} tamanho={34} />
                    </View>

                    <View style={styles.premiumSection}>
                        <Text style={styles.premiumLabel}>Estimativa de Prêmio</Text>
                        <Text style={styles.premiumValue}>
                            {formatCurrency(dados.valorEstimadoProximoConcurso)}
                        </Text>
                        <Text style={styles.premiumSub}>
                            para o próximo concurso, em{' '}
                            <Text style={{ fontWeight: 'bold' }}>{dados.dataProximoConcurso}</Text>
                        </Text>
                    </View>

                    <View style={styles.dividerLine} />

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>Premiação</Text>
                    </View>

                    <View style={styles.prizeTableWrapper}>
                        {listaPremios.map((r: any, i: number) => (
                            <View key={i} style={styles.prizeTierBox}>
                                <View style={styles.prizeTierHeader}>
                                    <Text style={styles.prizeTierHeaderText}>
                                        {r.descricao}
                                    </Text>
                                </View>
                                <View style={styles.prizeTierRow}>
                                    <View style={styles.prizeColLeft}>
                                        <Text style={styles.prizeRowText}>
                                            {formatGanhadores(r.numeroDeGanhadores)} ganhadores
                                        </Text>
                                    </View>
                                    <View style={styles.prizeColRight}>
                                        <Text style={styles.prizeRowText}>
                                            {formatCurrency(r.valorPremio)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.accumulationBox}>
                        <Text style={styles.accumulationLabel}>
                            Valor acumulado para o sorteio da Independência:
                        </Text>
                        <Text style={styles.accumulationValue}>
                            {formatCurrency(dados.valorAcumuladoEspecial)}
                        </Text>
                        <Text style={[styles.accumulationLabel, { marginTop: 15 }]}>
                            Arrecadação Total
                        </Text>
                        <Text style={styles.accumulationValue}>
                            {formatCurrency(dados.valorArrecadado)}
                        </Text>
                    </View>

                    <View style={styles.regionPart}>
                        <Text style={styles.regionSectionTitle}>Ganhadores por Região</Text>
                        <View style={styles.regionListBordered}>
                            {(dados.listaMunicipioUFGanhadores || []).map((m: any, i: number) => (
                                <View key={i} style={styles.regionItemRow}>
                                    <Text style={styles.regionItemText}>
                                        🎯 {m.municipio}/{m.uf}: {m.ganhadores} {m.ganhadores === 1 ? 'ganhador' : 'ganhadores'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 60,
        backgroundColor: '#7B3F9E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerBtn: { padding: 4 },
    scroll: { flex: 1 },
    content: { paddingBottom: 50 },
    contestHeader: { alignItems: 'center', marginTop: 15 },
    contestNumTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
    contestLocation: { fontSize: 14, color: '#333', marginTop: 3 },
    statsPurpleBar: {
        backgroundColor: '#5D2E7A',
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 15
    },
    statsBarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    ballsContainer: { paddingVertical: 20, alignItems: 'center', paddingHorizontal: 15 },
    premiumSection: { alignItems: 'center' },
    premiumLabel: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    premiumValue: { fontSize: 32, fontWeight: 'bold', color: '#B366FF', marginVertical: 4 },
    premiumSub: { fontSize: 14, color: '#555' },
    dividerLine: { height: 1, backgroundColor: '#CCC', marginHorizontal: 12, marginVertical: 15 },
    sectionHeader: { alignItems: 'center', marginBottom: 12 },
    sectionHeaderText: { fontSize: 20, fontWeight: 'bold', color: '#111' },
    prizeTableWrapper: { paddingHorizontal: 5 },
    prizeTierBox: { marginBottom: 2 },
    prizeTierHeader: { backgroundColor: '#5D2E7A', paddingVertical: 5, paddingHorizontal: 10 },
    prizeTierHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    prizeTierRow: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    prizeColLeft: { flex: 1 },
    prizeColRight: { flex: 1, alignItems: 'flex-end' },
    prizeRowText: { fontSize: 15, color: '#111' },
    accumulationBox: { alignItems: 'center', paddingVertical: 25 },
    accumulationLabel: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 40
    },
    accumulationValue: { fontSize: 24, fontWeight: 'bold', color: '#B366FF', marginTop: 5 },
    regionPart: { paddingHorizontal: 12, marginTop: 10 },
    regionSectionTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#111',
        textAlign: 'center',
        marginBottom: 15
    },
    regionListBordered: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EEE' },
    regionItemRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    regionItemText: { fontSize: 16, color: '#111' }
});