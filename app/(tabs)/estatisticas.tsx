import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SincronizacaoModal from '../../components/SincronizacaoModal';
import {
    obterEstatisticasAtrasos,
    obterEstatisticasCiclosHistorico,
    obterEstatisticasColunas,
    obterEstatisticasDezenaTipo,
    obterEstatisticasGeraisDistribuicao,
    obterEstatisticasLinhas,
    obterEstatisticasRepeticoes
} from '../../database/operations';

type StatType = 'atrasos' | 'linhas' | 'colunas' | 'pares' | 'impares' | 'primos' | 'fibonacci' | 'repeticoes' | 'sequencia' | 'soma' | 'ciclos';

export default function EstatisticasScreen() {
    const router = useRouter();
    const [stats, setStats] = useState<any[]>([]);
    const [statType, setStatType] = useState<StatType>('atrasos');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState({ inicio: 0, fim: 0 });
    const [selectedId, setSelectedId] = useState<number | string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'atraso', direction: 'desc' });
    const [cicloSummary, setCicloSummary] = useState<any>(null);

    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailItem, setDetailItem] = useState<any>(null);
    const [syncModalVisible, setSyncModalVisible] = useState(false);

    const carregarStats = useCallback(async () => {
        setLoading(true);
        setStats([]);
        try {
            if (statType === 'atrasos') {
                const result = await obterEstatisticasAtrasos();
                const sortedData = [...result.data].sort((a, b) => {
                    const { key, direction } = sortConfig;
                    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
                    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
                    return 0;
                });
                setStats(sortedData);
                setRange({ inicio: result.concursoInicio, fim: result.concursoFim });
            } else if (statType === 'linhas') {
                setSelectedId(null);
                const data = await obterEstatisticasLinhas();
                setStats(data);
                if (data && data.length > 0) {
                    setRange({ inicio: data[0].concursoInicio, fim: data[0].concursoFim });
                }
            } else if (statType === 'colunas') {
                setSelectedId(null);
                const data = await obterEstatisticasColunas();
                setStats(data);
                if (data && data.length > 0) {
                    setRange({ inicio: data[0].concursoInicio, fim: data[0].concursoFim });
                }
            } else if (['pares', 'impares', 'primos', 'fibonacci'].includes(statType)) {
                setSelectedId(null);
                const tipoMap: any = { pares: 'par', impares: 'impar', primos: 'primo', fibonacci: 'fibonacci' };
                const data = await obterEstatisticasDezenaTipo(tipoMap[statType]);
                setStats(data);
                if (data && data.length > 0) {
                    setRange({ inicio: data[0].concursoInicio, fim: data[0].concursoFim });
                }
            } else if (statType === 'repeticoes') {
                setSelectedId(null);
                const data = await obterEstatisticasRepeticoes();
                setStats(data);
                if (data && data.length > 0) {
                    setRange({ inicio: data[0].concursoInicio, fim: data[0].concursoFim });
                }
            } else if (statType === 'soma' || statType === 'sequencia') {
                setSelectedId(null);
                const data = await obterEstatisticasGeraisDistribuicao(statType);
                setStats(data);
                if (data && data.length > 0) {
                    setRange({ inicio: data[0].concursoInicio, fim: data[0].concursoFim });
                }
            } else if (statType === 'ciclos') {
                setSelectedId(null);
                const data = await obterEstatisticasCiclosHistorico();
                setStats(data.historico);
                setCicloSummary({ media: data.media, atual: data.cicloAtual });
                if (data.historico && data.historico.length > 0) {
                    setRange({ inicio: data.historico[data.historico.length - 1].inicio, fim: data.historico[0].inicio });
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    }, [statType, sortConfig]);

    useFocusEffect(useCallback(() => { carregarStats(); }, [carregarStats]));

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        setSortConfig({ key, direction });

        const sorted = [...stats].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setStats(sorted);
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return '⬍';
        return sortConfig.direction === 'asc' ? '▴' : '▾';
    };

    const renderChart = () => {
        if (statType === 'ciclos' && cicloSummary) {
            return (
                <View style={styles.cicloContainer}>
                    <View style={styles.cicloBallsGrid}>
                        {Array.from({ length: 25 }, (_, i) => i + 1).map(n => {
                            const sorteado = cicloSummary.atual.numerosSorteados.includes(n);
                            return (
                                <View key={`ciclo-bola-${n}`} style={[styles.cicloBola, sorteado && styles.cicloBolaSorteada]}>
                                    <Text style={[styles.cicloBolaText, sorteado && styles.cicloBolaTextSorteada]}>
                                        {n.toString().padStart(2, '0')}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.cicloMediaBar}>
                        <Text style={styles.cicloMediaText}>Média: {cicloSummary.media} concursos por ciclo</Text>
                    </View>
                </View>
            );
        }

        if (!['linhas', 'colunas', 'pares', 'impares', 'primos', 'fibonacci', 'repeticoes', 'soma', 'sequencia'].includes(statType) || stats.length === 0) return null;

        const dataForChart = statType === 'soma' ? stats.filter(s => s.ocorrencias > 2) : stats;
        const maxOcc = Math.max(...dataForChart.map(s => s.ocorrencias), 1);
        let ySteps: number[] = [];
        let yMax = 0;

        if (maxOcc > 1000) {
            yMax = Math.ceil(maxOcc / 1000) * 1000;
            ySteps = [yMax, yMax * 0.8, yMax * 0.6, yMax * 0.4, yMax * 0.2, 0].sort((a, b) => b - a);
        } else if (maxOcc > 500) {
            yMax = Math.ceil(maxOcc / 100) * 100;
            ySteps = [1000, 800, 600, 400, 200, 0].filter(v => v <= yMax || v === 0).sort((a, b) => b - a);
        } else {
            yMax = Math.ceil(maxOcc / 50) * 50;
            ySteps = [yMax, yMax * 0.8, yMax * 0.6, yMax * 0.4, yMax * 0.2, 0].sort((a, b) => b - a);
        }

        return (
            <View style={styles.chartContainer}>
                <View style={styles.gridLinesContainer}>
                    {ySteps.map((_, i) => (
                        <View key={`h-grid-${i}`} style={[styles.hGridLine, { top: (i / (ySteps.length - 1)) * 140 }]} />
                    ))}
                </View>

                <View style={styles.chartYAxis}>
                    {ySteps.map((val, idx) => (
                        <Text key={`yAxis-${idx}`} style={styles.yAxisText}>
                            {val.toLocaleString('pt-BR')}
                        </Text>
                    ))}
                </View>

                <View style={styles.chartBarsArea}>
                    <View style={styles.vGridLinesArea}>
                        {dataForChart.map((_, i) => (
                            <View key={`v-grid-${i}`} style={styles.vGridLine} />
                        ))}
                    </View>

                    <View style={styles.chartLabelsTop}>
                        {dataForChart.map((item, index) => (
                            <Text
                                key={`topLabel-${index}`}
                                style={[
                                    styles.topLabelText,
                                    { fontSize: 8, flex: 1, textAlign: 'center' },
                                    statType === 'soma' && { transform: [{ rotate: '-90deg' }], marginTop: 15, width: 40 }
                                ]}
                            >
                                {item.id}
                            </Text>
                        ))}
                    </View>

                    <View style={styles.chartBars}>
                        {dataForChart.map((item, index) => {
                            const isSelected = selectedId?.toString() === item.id?.toString();
                            const barHeight = (item.ocorrencias / yMax) * 140;
                            return (
                                <TouchableOpacity
                                    key={`barTouch-${index}`}
                                    style={styles.barWrapper}
                                    onPress={() => {
                                        const newId = isSelected ? null : item.id;
                                        setSelectedId(newId);
                                        setDetailItem(item);
                                        setDetailModalVisible(true);
                                    }}
                                >
                                    <View style={[styles.bar, {
                                        height: Math.max(barHeight, 2),
                                        backgroundColor: isSelected ? '#5D2E7A' : '#C4A1D5',
                                        borderColor: '#5D2E7A',
                                        borderWidth: isSelected ? 2 : 0,
                                        width: statType === 'soma' ? 10 : 30
                                    }]} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.chartXAxisLine} />
                </View>
            </View>
        );
    };

    const renderHeader = () => {
        if (statType === 'atrasos') {
            return (
                <View style={styles.tableHeaderAtrasos}>
                    <TouchableOpacity style={styles.colHeaderAtrasosBtn} onPress={() => handleSort('numero')}>
                        <Text style={styles.colHeaderText}>Dezena {getSortIcon('numero')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.colHeaderAtrasosBtn} onPress={() => handleSort('atraso')}>
                        <Text style={styles.colHeaderText}>Atrasos {getSortIcon('atraso')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.colHeaderAtrasosBtn} onPress={() => handleSort('ocorrencias')}>
                        <Text style={styles.colHeaderText}>Ocorrências {getSortIcon('ocorrencias')}</Text>
                    </TouchableOpacity>
                </View>
            );
        } else if (['linhas', 'colunas', 'pares', 'impares', 'primos', 'fibonacci', 'repeticoes', 'soma', 'sequencia'].includes(statType)) {
            const labelMap: any = {
                linhas: 'Linha',
                colunas: 'Coluna',
                pares: 'Pares',
                impares: 'Ímpares',
                primos: 'Primos',
                fibonacci: 'Fibonacci',
                repeticoes: 'Repetidos',
                soma: 'Somas',
                sequencia: 'Sequências',
            };
            return (
                <View style={styles.tableHeaderRows}>
                    <Text style={[styles.colHeaderRows, { flex: 1 }]}>{labelMap[statType]}</Text>
                    <Text style={[styles.colHeaderRows, { flex: 1.2 }]}>Ocorrências</Text>
                    <Text style={[styles.colHeaderRows, { flex: 0.8 }]}>%</Text>
                    <Text style={[styles.colHeaderRows, { flex: 1.2 }]}>Último Concurso</Text>
                </View>
            );
        } else if (statType === 'ciclos') {
            return (
                <View style={styles.tableHeaderRows}>
                    <Text style={[styles.colHeaderRows, { flex: 1 }]}>Ciclo</Text>
                    <Text style={[styles.colHeaderRows, { flex: 1 }]}>Início</Text>
                    <Text style={[styles.colHeaderRows, { flex: 1 }]}>Fim</Text>
                    <Text style={[styles.colHeaderRows, { flex: 1 }]}>Concursos</Text>
                </View>
            );
        }
        return null;
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        if (!item) return null;

        if (statType === 'atrasos') {
            const numero = item.numero !== undefined ? item.numero : 0;
            const isSelected = selectedId === numero;
            return (
                <TouchableOpacity
                    style={[styles.rowAtrasosCard, isSelected && styles.rowSelected]}
                    key={`row-atraso-${numero}-${index}`}
                    onPress={() => setSelectedId(isSelected ? null : numero)}
                >
                    <View style={styles.cellAtrasos}>
                        <View style={[styles.bola, isSelected && { borderColor: 'white' }]}>
                            <Text style={[styles.bolaText, isSelected && { color: 'white' }]}>{numero.toString().padStart(2, '0')}</Text>
                        </View>
                    </View>
                    <View style={styles.cellAtrasos}><Text style={[styles.valueAtrasos, isSelected && { color: 'white' }]}>{item.atraso ?? 0}</Text></View>
                    <View style={styles.cellAtrasos}><Text style={[styles.valueAtrasos, isSelected && { color: 'white' }]}>{item.ocorrencias ?? 0}</Text></View>
                </TouchableOpacity>
            );
        } else if (['linhas', 'colunas', 'pares', 'impares', 'primos', 'fibonacci', 'repeticoes', 'soma', 'sequencia'].includes(statType)) {
            const id = item.id !== undefined ? item.id : 0;
            const isSelected = selectedId?.toString() === id.toString();
            return (
                <TouchableOpacity
                    key={`row-${statType}-${id}-${index}`}
                    style={[styles.rowItemNormal, isSelected && styles.rowSelected]}
                    onPress={() => {
                        setSelectedId(isSelected ? null : id);
                        if (statType !== 'ciclos') {
                            setDetailItem(item);
                            setDetailModalVisible(true);
                        }
                    }}
                >
                    <Text style={[styles.cellTextNormal, { flex: 1 }, isSelected && styles.textSelected]}>{id}</Text>
                    <Text style={[styles.cellTextNormal, { flex: 1.2 }, isSelected && styles.textSelected]}>{item.ocorrencias ?? 0}</Text>
                    <Text style={[styles.cellTextNormal, { flex: 0.8 }, isSelected && styles.textSelected]}>{item.porcentagem ?? '0%'}</Text>
                    <Text style={[styles.cellTextNormal, { flex: 1.2 }, isSelected && styles.textSelected]}>{item.ultimoConcurso ?? '-'}</Text>
                </TouchableOpacity>
            );
        } else if (statType === 'ciclos') {
            return (
                <View key={`row-ciclo-${item.cicloId}`} style={styles.rowItemNormal}>
                    <Text style={[styles.cellTextNormal, { flex: 1 }]}>{item.cicloId}</Text>
                    <Text style={[styles.cellTextNormal, { flex: 1 }]}>{item.inicio}</Text>
                    <Text style={[styles.cellTextNormal, { flex: 1 }]}>{item.fim}</Text>
                    <Text style={[styles.cellTextNormal, { flex: 1 }]}>{item.quantidade}</Text>
                </View>
            );
        }
        return null;
    };

    const getStatTitle = () => {
        const titleMap: any = {
            atrasos: 'Atrasos e Ocorrências',
            linhas: 'Linhas',
            colunas: 'Colunas',
            pares: 'Números Pares',
            impares: 'Números Ímpares',
            primos: 'Números Primos',
            fibonacci: 'Números de Fibonacci',
            repeticoes: 'Repetições do Anterior',
            sequencia: 'Maior Sequência',
            soma: 'Soma das Dezenas',
            ciclos: 'Ciclos das Dezenas'
        };
        return titleMap[statType] || '';
    };

    const getDetailTypeLabel = () => {
        const map: any = {
            linhas: 'Linha',
            colunas: 'Coluna',
            pares: 'Pares',
            impares: 'Ímpares',
            primos: 'Primos',
            fibonacci: 'Fibonacci',
            repeticoes: 'Repetidos',
            soma: 'Soma',
            sequencia: 'Seq. Máx',
            ciclos: 'Ciclos'
        };
        const label = map[statType] || '';
        if (statType === 'linhas' || statType === 'colunas') return `${label}: ${detailItem?.id}`;
        return `${detailItem?.id} ${label}`;
    };

    return (
        <View style={styles.container}>
            {/* HEADER SUPERIOR (ROXO CLARO) */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} color="#FFF" /></TouchableOpacity>
                    <View style={styles.selectorContainer}>
                        <View style={styles.selectorTextRow}>
                            <Text style={styles.headerTitle}>LF</Text>
                            <View style={styles.triangle} />
                        </View>
                        <View style={styles.selectorUnderline} />
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => setSyncModalVisible(true)} style={{ marginRight: 15 }}>
                        <Ionicons name="cloud-download-outline" size={26} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(true)}><Ionicons name="options-outline" size={26} color="#FFF" /></TouchableOpacity>
                    <TouchableOpacity><Ionicons name="ellipsis-vertical" size={26} color="#FFF" style={{ marginLeft: 15 }} /></TouchableOpacity>
                </View>
            </View>

            {/* SUB-HEADER DE ÍCONES (BRANCO) */}
            <View style={styles.subHeader}>
                <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)')}>
                    <Ionicons name="logo-usd" size={28} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/meus-jogos')}>
                    <Ionicons name="star" size={28} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/resultados')}>
                    <Ionicons name="add" size={28} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.subTabItem, styles.subTabActive]}>
                    <Ionicons name="stats-chart" size={28} color="#27AE60" />
                    <View style={styles.activeIndicator} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>

                <Text style={styles.rangeInfo}>Estatísticas: Concurso {range.inicio.toString().padStart(3, '0')} até {range.fim}</Text>
                <View style={styles.sectionTitleBox}>
                    <Text style={styles.sectionTitleText}>{getStatTitle()}</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#7B3F9E" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={stats}
                        renderItem={renderItem}
                        extraData={selectedId}
                        keyExtractor={(item, index) => `${statType}-${item.id || item.numero || index}`}
                        ListHeaderComponent={() => (
                            <View style={{ backgroundColor: 'white' }}>
                                {renderChart()}
                                {renderHeader()}
                            </View>
                        )}
                        stickyHeaderIndices={[0]}
                        contentContainerStyle={{ paddingBottom: 20, backgroundColor: 'white' }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Modal de Tipo de Estatística */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Tipo de Estatística</Text>
                        <ScrollView>
                            {[
                                { id: 'atrasos', label: 'Atrasos e Ocorrências' },
                                { id: 'linhas', label: 'Linhas' },
                                { id: 'colunas', label: 'Colunas' },
                                { id: 'pares', label: 'Números Pares' },
                                { id: 'impares', label: 'Números Ímpares' },
                                { id: 'primos', label: 'Números Primos' },
                                { id: 'fibonacci', label: 'Números de Fibonacci' },
                                { id: 'repeticoes', label: 'Repetições do Concurso Anterior' },
                                { id: 'sequencia', label: 'Números em Sequência' },
                                { id: 'soma', label: 'Soma das Dezenas' },
                                { id: 'ciclos', label: 'Ciclos dos Concursos' },
                            ].map((item) => (
                                <TouchableOpacity key={item.id} style={styles.modalItem} onPress={() => { setStatType(item.id as StatType); setModalVisible(false); }}>
                                    <Text style={[styles.modalItemText, statType === item.id && styles.modalItemActive]}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal de Detalhes - Igual à Foto do Usuário */}
            <Modal animationType="fade" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.detailBoxSimple}>
                        {detailItem && (
                            <>
                                <Text style={styles.detailTitleSimples}>{getDetailTypeLabel()}</Text>
                                <Text style={styles.detailTextSimples}>
                                    Último Concurso de Ocorrência: {detailItem.ultimoConcurso}
                                </Text>
                                <Text style={styles.detailTextSimples}>
                                    Dezenas: {detailItem.dezenasUltimoNumeros?.map((n: number) => n.toString().padStart(2, '0')).join(', ')}
                                </Text>

                                <TouchableOpacity style={styles.detailCloseBtnSimples} onPress={() => setDetailModalVisible(false)}>
                                    <Text style={styles.detailCloseTextSimples}>FECHAR</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <SincronizacaoModal
                visible={syncModalVisible}
                onClose={() => setSyncModalVisible(false)}
                onFinish={() => {
                    setSyncModalVisible(false);
                    carregarStats(); // Recarregar dados após sync
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EEE' },
    header: {
        height: 60,
        backgroundColor: '#A556BE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 5
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    selectorContainer: { marginLeft: 20, alignItems: 'center' },
    selectorTextRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
        transform: [{ rotate: '180deg' }],
        marginLeft: 8,
        marginBottom: 4
    },
    selectorUnderline: { width: 35, height: 2, backgroundColor: 'white', opacity: 0.8 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    subHeader: {
        height: 55,
        backgroundColor: 'white',
        flexDirection: 'row',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    subTabItem: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    subTabActive: {},
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: 3,
        backgroundColor: '#A556BE'
    },
    content: { flex: 1 },
    sectionTitleBox: { backgroundColor: '#5D2E7A', padding: 12, marginHorizontal: 5, borderRadius: 4, alignItems: 'center', marginBottom: 10 },
    sectionTitleText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    chartContainer: { height: 200, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    gridLinesContainer: { position: 'absolute', top: 20, left: 55, right: 10, bottom: 40, zIndex: 0 },
    hGridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#EEE' },
    chartYAxis: { width: 45, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 5, zIndex: 1 },
    yAxisText: { fontSize: 10, color: '#666' },
    chartBarsArea: { flex: 1, justifyContent: 'flex-end', marginLeft: 5 },
    vGridLinesArea: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 20 },
    vGridLine: { width: 1, height: '100%', backgroundColor: '#F0F0F0' },
    chartLabelsTop: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, height: 40, alignItems: 'center' },
    topLabelText: { fontSize: 10, color: '#333' },
    chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140, zIndex: 2 },
    barWrapper: { alignItems: 'center', flex: 1 },
    bar: { borderTopLeftRadius: 1, borderTopRightRadius: 1 },
    chartXAxisLine: { height: 1, backgroundColor: '#999' },
    tableHeaderAtrasos: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: 'white' },
    colHeaderAtrasosBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    colHeaderText: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    rowAtrasosCard: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 12, marginBottom: 8, paddingVertical: 14, borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cellAtrasos: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    bola: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' },
    bolaText: { fontWeight: 'bold', fontSize: 18, color: '#333' },
    valueAtrasos: { fontSize: 26, fontWeight: 'bold', color: '#000' },
    tableHeaderRows: { flexDirection: 'row', backgroundColor: '#5D2E7A', paddingVertical: 12 },
    colHeaderRows: { color: 'white', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
    rowItemNormal: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: 'white' },
    cellTextNormal: { textAlign: 'center', fontSize: 15, color: '#333', fontWeight: '400' },
    rowSelected: { backgroundColor: '#7B3F9E' },
    textSelected: { color: 'white', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', width: '85%', maxHeight: '80%', borderRadius: 4, paddingVertical: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    modalItem: { paddingHorizontal: 20, paddingVertical: 15 },
    modalItemText: { fontSize: 16, color: '#333' },
    modalItemActive: { color: '#7B3F9E', fontWeight: 'bold' },
    // Estilos do Modal de Detalhes (Igual à Foto)
    detailBoxSimple: { backgroundColor: 'white', width: '85%', borderRadius: 4, padding: 25, elevation: 5 },
    detailTitleSimples: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    detailTextSimples: { fontSize: 16, color: '#666', marginBottom: 15, lineHeight: 22 },
    detailCloseBtnSimples: { alignSelf: 'flex-end', marginTop: 10 },
    detailCloseTextSimples: { color: '#7B3F9E', fontWeight: 'bold', fontSize: 17 },
    // Ciclo Styles
    cicloContainer: { backgroundColor: 'white', paddingBottom: 0 },
    cicloBallsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
    cicloBola: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', margin: 4 },
    cicloBolaSorteada: { backgroundColor: '#7B3F9E', borderColor: '#7B3F9E' },
    cicloBolaText: { fontSize: 13, fontWeight: 'bold', color: '#333' },
    cicloBolaTextSorteada: { color: 'white' },
    cicloMediaBar: { backgroundColor: '#5D2E7A', paddingVertical: 10, alignItems: 'center' },
    cicloMediaText: { color: 'white', fontWeight: 'bold', fontSize: 15 }
});
