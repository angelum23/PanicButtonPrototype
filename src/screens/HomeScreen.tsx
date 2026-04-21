import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Precisa de ajuda?</Text>
        <Text style={styles.subtitle}>Toque no botão abaixo para iniciar</Text>
        
        <TouchableOpacity 
          style={styles.sosButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Breathing')}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.s,
  },
  subtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    marginBottom: spacing.xxl,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  sosText: {
    fontSize: typography.sizes.xxlarge,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
