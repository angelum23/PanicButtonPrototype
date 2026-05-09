import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import Step1Icon from '../components/svg/Step1Icon';
import Step2Icon from '../components/svg/Step2Icon';
import Step3Icon from '../components/svg/Step3Icon';
import Step4Icon from '../components/svg/Step4Icon';
import { insertRelaxationSession, updateRelaxationSession } from '../db/database';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Relaxation'>;
type RelaxationRouteProp = RouteProp<RootStackParamList, 'Relaxation'>;

const STEPS: { number: number; Icon: React.FC<{ width?: number; height?: number; color?: string }>; bgColor: string; text: string }[] = [
  {
    number: 1,
    Icon: Step1Icon,
    bgColor: '#EDE7F6',
    text: 'Encontre um local seguro e sente-se ou deite-se em posição fetal (abraçando os joelhos).',
  },
  {
    number: 2,
    Icon: Step2Icon,
    bgColor: '#FFF8E1',
    text: 'Aperte todo o seu corpo o mais forte que puder pelo maior tempo que conseguir.',
  },
  {
    number: 3,
    Icon: Step3Icon,
    bgColor: '#E8F5E9',
    text: 'Quando sentir que não aguenta mais, solte toda a tensão de uma vez.',
  },
  {
    number: 4,
    Icon: Step4Icon,
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
  const route = useRoute<RelaxationRouteProp>();
  const groundingSessionId = route.params?.groundingSessionId;

  // ─── Session tracking ────────────────────────────────────────────────
  const sessionIdRef = useRef<number | null>(null);
  const exitHandledRef = useRef(false);

  const finalizeSession = useCallback(async (destination: string) => {
    if (exitHandledRef.current || sessionIdRef.current === null) return;
    exitHandledRef.current = true;
    try {
      await updateRelaxationSession(sessionIdRef.current, destination);
    } catch (e) {
      console.warn('Falha ao registrar saída da sessão de relaxamento:', e);
    }
  }, []);

  // Insert session record on mount
  useEffect(() => {
    (async () => {
      try {
        const id = await insertRelaxationSession(groundingSessionId);
        sessionIdRef.current = id;
      } catch (e) {
        console.warn('Falha ao registrar abertura da sessão de relaxamento:', e);
      }
    })();
  }, [groundingSessionId]);

  // Capture back / gesture exits
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      finalizeSession('back');
    });
    return unsubscribe;
  }, [navigation, finalizeSession]);

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
              <step.Icon width={86} height={86} />
            </View>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={async () => {
            await finalizeSession('Rating');
            navigation.navigate('Rating', {
              relaxationSessionId: sessionIdRef.current ?? undefined,
            });
          }}
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
