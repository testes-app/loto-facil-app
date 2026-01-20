import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { salvarJogo, verificarHistoricoPremiacao } from '../../database/operations';
import { AIStrategy, gerarJogoIA } from '../../services/aiGenerator';

export default function CriarJogoScreen() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);
    const [historicoPremiacao, setHistoricoPremiacao] = useState<{ acertos15: number[]; acertos14: number[] } | null>(null);

    const todosNumeros = Array.from({ length: 25 }, (_, i) => i + 1);

    React.useEffect(() => {
        const checkHistorico = async () => {
            if (numerosSelecionados.length >= 15) {
                const numerosParaChecar = numerosSelecionados.slice(0, 15);
                const resultado = await verificarHistoricoPremiacao(numerosParaChecar);
                setHistoricoPremiacao(resultado);
            } else {
                setHistoricoPremiacao(null);
            }
        };
        const timer = setTimeout(checkHistorico, 500);
        return () => clearTimeout(timer);
    }, [numerosSelecionados]);

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

    const handleGerarIA = async (strategy: AIStrategy) => {
        setLoadingAI(true);
        setModalVisible(false);
        try {
            // Se o usuário selecionou mais números manualmente, respeitar, senão usar 15
            const qtd = numerosSelecionados.length >= 15 ? numerosSelecionados.length : 15;
            const novosNumeros = await gerarJogoIA(strategy, qtd);
            setNumerosSelecionados(novosNumeros);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao gerar jogo.');
        } finally {
            setLoadingAI(false);
        }
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
                { text: 'Ver Meus Jogos', onPress: () => router.push('/(tabs)/meus-jogos') },
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
                    <TouchableOpacity onPress={() => setModalVisible(true)}><Ionicons name="bulb-outline" size={26} color="#FFF" /></TouchableOpacity>
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
                <TouchableOpacity style={[styles.subTabItem, styles.subTabActive]}>
                    <Ionicons name="add" size={28} color="#A556BE" />
                    <View style={styles.activeIndicator} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.subTabItem} onPress={() => router.push('/(tabs)/estatisticas')}>
                    <Ionicons name="stats-chart" size={28} color="#CCC" />
                </TouchableOpacity>
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

                {/* Lógica do Termômetro */}
                {(() => {
                    const { pares, soma } = stats;
                    const qtd = numerosSelecionados.length;

                    // Ajuste de tipagem para incluir 'atencao' (Laranja)
                    let qualidade: 'neutro' | 'ruim' | 'bom' | 'excelente' | 'atencao' = 'neutro';
                    let msg = '';

                    const fez15Pontos = historicoPremiacao?.acertos15 && historicoPremiacao.acertos15.length > 0;
                    const fez14Pontos = historicoPremiacao?.acertos14 && historicoPremiacao.acertos14.length > 0;

                    if (qtd >= 15) {
                        if (fez15Pontos) {
                            qualidade = 'ruim';
                            const ultimoConcurso = historicoPremiacao?.acertos15[0];
                            msg = `⚠️ Já Sorteado! (Conc. ${ultimoConcurso})`;
                        } else if (fez14Pontos) {
                            qualidade = 'atencao';
                            const qtd14 = historicoPremiacao?.acertos14.length;
                            const ultimo14 = historicoPremiacao?.acertos14[0];
                            msg = `😯 Já fez 14pts ${qtd14}x (Últ: ${ultimo14})`;
                        } else {
                            // Regra simplificada de ouro da Lotofácil
                            const paresAceitaveis = [7, 8, 9];
                            const somaAceitavel = soma >= 180 && soma <= 230;

                            if (paresAceitaveis.includes(pares) && somaAceitavel) {
                                qualidade = 'excelente';
                                msg = '🌟 Jogo Profissional!';
                            } else if (Math.abs(pares - 7.5) > 3 || soma < 160 || soma > 250) {
                                qualidade = 'ruim';
                                msg = '⚠️ Muito Desequilibrado';
                            } else {
                                qualidade = 'bom';
                                msg = '⚖️ Jogo Equilibrado';
                            }
                        }
                    }

                    const bgColors: Record<string, string> = {
                        neutro: '#5D2E7A',
                        ruim: '#C0392B',      // Vermelho
                        atencao: '#F39C12',   // Laranja (Novo)
                        bom: '#2980B9',       // Azul
                        excelente: '#27AE60'  // Verde
                    };

                    const corFundo = bgColors[qualidade] || bgColors.neutro;

                    return (
                        <>
                            <View style={[styles.statsBar, { backgroundColor: corFundo }]}>
                                <Text style={styles.statLabel}>Par: {stats.pares}</Text>
                                <Text style={styles.statLabel}>Ímpar: {stats.impares}</Text>
                                <Text style={styles.statLabel}>Primo: {stats.primos}</Text>
                                <Text style={styles.statLabel}>Soma: {stats.soma}</Text>
                            </View>

                            {/* Termômetro Visual */}
                            {qtd >= 15 && (
                                <View style={[styles.termometroContainer, { borderColor: corFundo }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons
                                            name={fez15Pontos ? 'alert-circle' : fez14Pontos ? 'alert-outline' : (qualidade === 'excelente' ? 'ribbon' : qualidade === 'ruim' ? 'warning' : 'checkmark-circle')}
                                            size={20}
                                            color={corFundo}
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={[styles.termometroText, { color: corFundo }]}>{msg}</Text>
                                    </View>
                                </View>
                            )}
                        </>
                    );
                })()}

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

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gerador Inteligente</Text>

                        <TouchableOpacity style={styles.modalItem} onPress={() => handleGerarIA('random')}>
                            <Ionicons name="dice-outline" size={24} color="#7B3F9E" style={{ marginRight: 10 }} />
                            <View>
                                <Text style={styles.modalItemTitle}>Surpresinha Aleatória</Text>
                                <Text style={styles.modalItemDesc}>Números totalmente aleatórios</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalItem} onPress={() => handleGerarIA('most_frequent')}>
                            <Ionicons name="flame-outline" size={24} color="#E74C3C" style={{ marginRight: 10 }} />
                            <View>
                                <Text style={styles.modalItemTitle}>Mais Frequentes</Text>
                                <Text style={styles.modalItemDesc}>Baseado nos que mais saem (Quentes)</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalItem} onPress={() => handleGerarIA('most_delayed')}>
                            <Ionicons name="time-outline" size={24} color="#F39C12" style={{ marginRight: 10 }} />
                            <View>
                                <Text style={styles.modalItemTitle}>Mais Atrasados</Text>
                                <Text style={styles.modalItemDesc}>Foca nos que não saem há tempo</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalItem} onPress={() => handleGerarIA('balanced')}>
                            <Ionicons name="scale-outline" size={24} color="#3498DB" style={{ marginRight: 10 }} />
                            <View>
                                <Text style={styles.modalItemTitle}>Equilibrado</Text>
                                <Text style={styles.modalItemDesc}>Média de Pares, Ímpares e Soma</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    clearBtnText: { color: '#999', fontWeight: 'bold', fontSize: 14 },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', width: '85%', borderRadius: 10, paddingVertical: 10, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#5D2E7A', textAlign: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 5 },
    modalItem: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    modalItemTitle: { fontSize: 16, color: '#333', fontWeight: 'bold' },
    modalItemDesc: { fontSize: 13, color: '#888', marginTop: 2 },

    // Termometro
    termometroContainer: {
        marginBottom: 20,
        marginTop: -10, // Aproxima da barra de stats
        padding: 8,
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: '#FFF',
        alignItems: 'center',
        elevation: 1
    },
    termometroText: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    }
});
