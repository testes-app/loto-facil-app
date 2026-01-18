import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { openDatabase } from '../database/db';
import { popularConcursosIniciais, sincronizarUltimosConcursos } from '../database/operations';

export default function RootLayout() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await openDatabase();
      console.log('Banco de dados inicializado com sucesso!');

      // Popula dados iniciais se necessário
      await popularConcursosIniciais();

      // Busca resultados mais recentes da API
      await sincronizarUltimosConcursos();
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
    }
  };

  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='resultado-detalhe' options={{ headerShown: false }} />
    </Stack>
  );
}
