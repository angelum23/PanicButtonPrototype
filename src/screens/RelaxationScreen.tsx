import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Relaxation'>;

const STEPS: { number: number; svg: ImageSourcePropType; bgColor: string; text: string }[] = [
  {
    number: 1,
    svg: require('../svg/step1.svg'),
    bgColor: '#EDE7F6',
    text: 'Encontre um local seguro e sente-se ou deite-se em posição fetal (abraçando os joelhos).',
  },
  {
    number: 2,
    svg: require('../svg/step2.svg'),
    bgColor: '#FFF8E1',
    text: 'Aperte todo o seu corpo o mais forte que puder pelo maior tempo que conseguir.',
  },
  {
    number: 3,
    svg: require('../svg/step3.svg'),
    bgColor: '#E8F5E9',
    text: 'Quando sentir que não aguenta mais, solte toda a tensão de uma vez.',
  },
  {
    number: 4,
    svg: require('../svg/step4.svg'),
    bgColor: '#E3F2FD',
    text: 'Respire fundo e relaxe. Repita o ciclo quantas vezes quiser para relaxar.',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.m;
const HORIZONTAL_PADDING = spacing.l;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function RelaxationScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relaxamento Muscular</Text>
      <Text style={styles.subtitle}>Siga as instruções abaixo</Text>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {STEPS.map((step) => (
          <View key={step.number} style={[styles.stepCard, { width: CARD_WIDTH }]}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{step.number}</Text>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: step.bgColor }]}>
              <Image source={step.svg} style={styles.stepIcon} />
            </View>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
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
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.m,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  stepIcon: {
    width: 86,
    height: 86,
  },
  stepBadge: {
    backgroundColor: colors.secondary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  stepBadgeText: {
    color: colors.text,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.small,
    lineHeight: 26,
    textAlign: 'center',
  },
  stepText: {
    fontSize: typography.sizes.small,
    color: colors.text,
    lineHeight: 20,
    textAlign: 'center',
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
  },
});
