import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Providers
import { JogosProvider } from './src/store/JogosContext';
import { ResultadosProvider } from './src/store/ResultadosContext';
import { ConfigProvider } from './src/store/ConfigContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export default function App() {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Nova Atualização!',
            'Uma nova versão do Loto Master foi baixada. Deseja reiniciar agora para aplicar?',
            [
              { text: 'Depois', style: 'cancel' },
              { text: 'Reiniciar', onPress: async () => await Updates.reloadAsync() }
            ]
          );
        }
      } catch (error) {
        // Silencioso se der erro (ex: sem internet)
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ConfigProvider>
        <ResultadosProvider>
          <JogosProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </JogosProvider>
        </ResultadosProvider>
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
