import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Resultados' }}
      />
      <Tabs.Screen
        name="resultados"
        options={{ title: 'Criar Jogo' }}
      />
      <Tabs.Screen
        name="meus-jogos"
        options={{ title: 'Meus Jogos' }}
      />
      <Tabs.Screen
        name="estatisticas"
        options={{ title: 'Estatísticas' }}
      />
      <Tabs.Screen
        name="consulta"
        options={{ href: null }}
      />
    </Tabs>
  );
}
