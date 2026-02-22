import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RankingsScreen from './src/screens/RankingsScreen';

const THEME = {
  primaryColor: '#6B46C1',
  backgroundColor: '#FFFFFF',
  activeTabColor: '#6B46C1',
  inactiveTabColor: 'gray',
  headerTextColor: '#FFFFFF',
  borderColor: '#E0E0E0',
};

const TABS_CONFIG = [
  {
    name: 'Home',
    component: HomeScreen,
    icon: 'home',
    iconFocused: 'home',
    headerTitle: 'LotoMatrix',
  },
  {
    name: 'Histórico',
    component: HistoryScreen,
    icon: 'time-outline',
    iconFocused: 'time',
    headerTitle: '📜 Histórico de Resultados',
  },
  {
    name: 'Rankings',
    component: RankingsScreen,
    icon: 'trophy-outline',
    iconFocused: 'trophy',
    headerTitle: '🏆 Rankings',
  },
];

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const insets = useSafeAreaInsets();

  const getTabBarIcon = (routeName, focused) => {
    const tab = TABS_CONFIG.find(t => t.name === routeName);
    if (!tab) return 'help-circle-outline';
    return focused ? tab.iconFocused : tab.icon;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabBarIcon(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: THEME.activeTabColor,
        tabBarInactiveTintColor: THEME.inactiveTabColor,
        tabBarStyle: {
          backgroundColor: THEME.backgroundColor,
          borderTopWidth: 1,
          borderTopColor: THEME.borderColor,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: THEME.primaryColor,
        },
        headerTintColor: THEME.headerTextColor,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      {TABS_CONFIG.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            headerTitle: tab.headerTitle,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.primaryColor}
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}