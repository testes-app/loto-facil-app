import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sincronizarHistoricoCompleto } from '../database/operations';

interface SincronizacaoModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: () => void;
}

export default function SincronizacaoModal({ visible, onClose, onFinish }: SincronizacaoModalProps) {
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState('Iniciando...');
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (visible && !syncing) {
            iniciarSincronizacao();
        }
    }, [visible]);

    const iniciarSincronizacao = async () => {
        setSyncing(true);
        setStatus('Calculando concursos faltantes...');
        setProgress(0);

        try {
            await sincronizarHistoricoCompleto((p, t) => {
                setProgress(p);
                setTotal(t);
                setStatus(`Baixando concurso ${p} de ${t}...`);
            });
            setStatus('Concluído!');
            setTimeout(() => {
                setSyncing(false);
                onFinish();
            }, 1000);
        } catch (error) {
            console.error(error);
            setStatus('Erro na sincronização. Tente novamente.');
            setSyncing(false);
        }
    };

    const percentage = total > 0 ? (progress / total) * 100 : 0;

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={() => { if (!syncing) onClose(); }}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Sincronizando Histórico</Text>
                    <Text style={styles.modalText}>
                        Estamos atualizando a base de dados com todos os resultados da Lotofácil para gerar estatísticas precisas.
                    </Text>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{status} ({Math.round(percentage)}%)</Text>

                    {!syncing && (
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={onClose}
                        >
                            <Text style={styles.textStyle}>Fechar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    modalView: {
        width: '90%',
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#5D2E7A'
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        color: '#666'
    },
    progressContainer: {
        height: 10,
        width: '100%',
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 10
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#5D2E7A'
    },
    progressText: {
        marginBottom: 20,
        color: '#333',
        fontWeight: '500'
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        minWidth: 100
    },
    buttonClose: {
        backgroundColor: '#5D2E7A',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
