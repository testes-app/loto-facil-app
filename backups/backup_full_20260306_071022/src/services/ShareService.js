import * as Clipboard from 'expo-clipboard';
import { Share, Alert } from 'react-native';

const ShareService = {
  formatarCombinacao(combinacao) {
    const numerosFormatados = combinacao.numeros
      .sort((a, b) => a - b)
      .map(n => n.toString().padStart(2, '0'))
      .join(' ');

    const header = combinacao.rank ? '�� Combinação #' + combinacao.rank : '🎯 Combinação Lotofácil';
    const score = '📊 Score: ' + combinacao.score.toFixed(1);
    const numeros = '🔢 ' + numerosFormatados;
    const soma = '➕ Soma: ' + combinacao.soma;
    
    return header + '\n\n' + score + '\n' + numeros + '\n' + soma + '\n\n' + 'Gerado por Lotofácil Top 17';
  },

  async copiarParaClipboard(combinacao) {
    try {
      const texto = this.formatarCombinacao(combinacao);
      await Clipboard.setStringAsync(texto);
      Alert.alert('✅ Copiado!', 'Combinação copiada para a área de transferência');
      return true;
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível copiar');
      return false;
    }
  },

  async compartilhar(combinacao) {
    try {
      const texto = this.formatarCombinacao(combinacao);
      const result = await Share.share({
        message: texto,
        title: 'Combinação Lotofácil'
      });

      if (result.action === Share.sharedAction) {
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível compartilhar');
      return false;
    }
  }
};

export default ShareService;