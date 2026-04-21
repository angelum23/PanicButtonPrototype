import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Relaxation'>;

export default function RelaxationScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relaxamento Muscular</Text>
      <Text style={styles.subtitle}>Siga as instruções abaixo</Text>

      <ScrollView style={styles.instructionsContainer}>
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Encontre um local seguro e sente-se ou deite-se em posição fetal (abraçando os joelhos).</Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Aperte todo o seu corpo o mais forte que puder pelo tempo que conseguir.</Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>Solte de uma vez e sinta o relaxamento profundo.</Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepText}>Respire fundo e repita o processo.</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Rating')}
        >
          <Text style={styles.buttonTextDark}>Eu melhorei</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  instructionsContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.l,
  },
  stepCard: {
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: 16,
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    color: colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 32,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.medium,
    marginRight: spacing.m,
  },
  stepText: {
    flex: 1,
    fontSize: typography.sizes.medium,
    color: colors.text,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacing.l,
    marginTop: spacing.l,
  },
  button: {
    paddingVertical: spacing.m,
    borderRadius: 25,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  buttonTextDark: {
    color: colors.text,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.medium,
  }
});
