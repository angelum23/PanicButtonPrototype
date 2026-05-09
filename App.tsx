import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDb } from './src/db/database';
import { colors } from './src/theme';

export default function App() {
  const [isDbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const setupDb = useCallback(async () => {
    setDbError(null);
    try {
      await initDb();
      setDbReady(true);
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      console.error("Falha ao inicializar o banco de dados:", errorMsg);
      setDbError(errorMsg);
    }
  }, []);

  useEffect(() => {
    setupDb();
  }, [setupDb]);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>
          Erro ao iniciar banco de dados
        </Text>
        <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 20 }}>
          {dbError}
        </Text>
        <TouchableOpacity
          onPress={setupDb}
          style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
