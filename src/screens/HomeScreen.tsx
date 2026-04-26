import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../navigation/types';
import { getUserProfile, UserProfile } from '../db/database';

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList, 'HomeTab'>>();
  const handleBreathingPress = () => {
    navigation.navigate('EmergencyTab', { screen: 'Breathing' });
  };
  const handleGroundingPress = () => {
    navigation.navigate('EmergencyTab', { screen: 'Grounding' });
  };
  const handleRelaxationPress = () => {
    navigation.navigate('EmergencyTab', { screen: 'Relaxation' });
  };
  const handleRatingPress = () => {
    navigation.navigate('EmergencyTab', { screen: 'Rating' });
  };
  const handleEmergencyPress = async () => {
    try {
      if (!profile || !profile.emergencyPhone.trim()) {
        Alert.alert(
          'Nenhum número cadastrado',
          'Cadastre um número de emergência na tela de Cadastro.',
          [
            { text: 'Ir para Cadastro', onPress: () => navigation.navigate('RegistrationTab') },
            { text: 'OK', style: 'cancel' },
          ]
        );
        return;
      }

      const phoneNumber = profile.emergencyPhone.replace(/\D/g, '');
      const url = `tel:${phoneNumber}`;

      console.log('Ligando para: ', phoneNumber);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível realizar a ligação neste dispositivo.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar ligar. Tente novamente.');
    }
  };

  const handleTherapistPress = async () => {
    try {
      const profile = await getUserProfile();
      console.log('Profile: ', profile)

      if (!profile || !profile.therapistPhone.trim()) {
        Alert.alert(
          'Nenhum número cadastrado',
          'Cadastre um número de terapeuta na tela de Cadastro.',
          [
            { text: 'Ir para Cadastro', onPress: () => navigation.navigate('RegistrationTab') },
            { text: 'OK', style: 'cancel' },
          ]
        );
        return;
      }

      const phoneNumber = profile.therapistPhone.replace(/\D/g, '');
      const url = `tel:${phoneNumber}`;

      console.log('Ligando para: ', phoneNumber);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível realizar a ligação neste dispositivo.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar ligar. Tente novamente.');
    }
  };

  useEffect(() => {
    async function setup() {
      try {
        const profile = await getUserProfile();
        setProfile(profile);
      } catch (e) {
        console.error("Falha ao buscar perfil", e);
      }
    }
    setup();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá {profile?.name}!</Text>
        <Text style={styles.headerSubtitle}>
          Como você está se sentindo hoje?
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEmoji}>🧘</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Dica do dia</Text>
          <Text style={styles.cardDescription}>
            Reserve 5 minutos para respirar profundamente. Isso pode reduzir a ansiedade em até 40%.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ferramentas disponíveis</Text>

      <View style={styles.toolsGrid}>
        <TouchableOpacity style={styles.toolCard} onPress={handleBreathingPress}>
          <Text style={styles.toolEmoji}>🫁</Text>
          <Text style={styles.toolTitle}>Respiração</Text>
          <Text style={styles.toolDesc}>Exercícios guiados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={handleGroundingPress}>
          <Text style={styles.toolEmoji}>🌿</Text>
          <Text style={styles.toolTitle}>Grounding</Text>
          <Text style={styles.toolDesc}>Técnica 5-4-3-2-1</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={handleRelaxationPress}>
          <Text style={styles.toolEmoji}>💪</Text>
          <Text style={styles.toolTitle}>Relaxamento</Text>
          <Text style={styles.toolDesc}>Liberar tensão</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={handleRatingPress}>
          <Text style={styles.toolEmoji}>🌟</Text>
          <Text style={styles.toolTitle}>Avalie</Text>
          <Text style={styles.toolDesc}>Como você se sente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Precisa de ajuda?</Text>
        <Text style={styles.infoText}>
          Caso seja necessário, procure ajuda profissional imediatamente.
        </Text>
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyPress}>
          <Text style={styles.emergencyButtonText}>Ligar para contato de emergência</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emergencyButton} onPress={handleTherapistPress}>
          <Text style={styles.emergencyButtonText}>Ligar para terapeuta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textLight,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.m,
    padding: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardEmoji: {
    fontSize: 40,
    marginRight: spacing.m,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.sizes.small,
    color: colors.textLight,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.m,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  toolCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  toolEmoji: {
    fontSize: 16,
    marginBottom: spacing.s,
  },
  toolTitle: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 12,
    color: colors.textLight,
  },
  infoCard: {
    backgroundColor: 'rgba(188, 160, 220, 0.15)',
    borderRadius: borderRadius.m,
    padding: spacing.l,
  },
  infoTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.s,
  },
  infoText: {
    fontSize: typography.sizes.small,
    color: colors.textLight,
    lineHeight: 22,
  },
  emergencyButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
