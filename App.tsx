import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDb } from './src/db/database';
import { colors } from './src/theme';

export default function App() {
  const [isDbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDb();
        setDbReady(true);
      } catch (e) {
        console.error("Falha ao inicializar o banco de dados", e);
      }
    }
    setup();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>Iniciando ambiente seguro...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}
