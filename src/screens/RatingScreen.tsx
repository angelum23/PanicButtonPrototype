import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { insertLog } from '../db/database';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Rating'>;

export default function RatingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [rating, setRating] = useState<number | null>(null);

  const handleSave = async () => {
    if (rating === null) return;
    try {
      await insertLog(rating);
      Alert.alert('Registro Salvo', 'Sua intensidade foi registrada com sucesso.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como você está agora?</Text>
      <Text style={styles.subtitle}>Avalie a intensidade da sua ansiedade de 1 a 10</Text>

      <View style={styles.ratingGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.ratingCircle,
              rating === num && styles.ratingCircleSelected
            ]}
            onPress={() => setRating(num)}
          >
            <Text style={[
              styles.ratingText,
              rating === num && styles.ratingTextSelected
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.button, rating === null && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={rating === null}
      >
        <Text style={styles.buttonText}>Finalizar e Voltar</Text>
      </TouchableOpacity>
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
    paddingHorizontal: spacing.l,
  },
  title: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    marginTop: spacing.s,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.m,
    marginBottom: spacing.xxl,
  },
  ratingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingCircleSelected: {
    backgroundColor: colors.primary,
  },
  ratingText: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  ratingTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.medium,
  }
});
