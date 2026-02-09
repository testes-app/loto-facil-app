import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import GeradorScreen from '../screens/GeradorScreen';
import AnalisadorScreen from '../screens/AnalisadorScreen';
import EstatisticasScreen from '../screens/EstatisticasScreen';
import MeusJogosScreen from '../screens/MeusJogosScreen';
import ResultadosScreen from '../screens/ResultadosScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: colors.bgCard,
          borderRadius: 20,
          height: 65,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          paddingBottom: 0, // Removido padding excessivo pois agora a barra flutua
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Gerador"
        component={GeradorScreen}
        options={{
          tabBarLabel: 'Gerador',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎲</Text>,
        }}
      />
      <Tab.Screen
        name="Analisador"
        component={AnalisadorScreen}
        options={{
          tabBarLabel: 'IA',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="Estatisticas"
        component={EstatisticasScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="MeusJogos"
        component={MeusJogosScreen}
        options={{
          tabBarLabel: 'Jogos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💾</Text>,
        }}
      />
      <Tab.Screen
        name="Resultados"
        component={ResultadosScreen}
        options={{
          tabBarLabel: 'Resultados',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏆</Text>,
        }}
      />
    </Tab.Navigator>
  );
}