import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { Check, Mic } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Grounding'>;

enum Status {
  Pending = 'pending',
  Recording = 'recording',
  Completed = 'completed',
}

const SENSES = [
  { id: 5, text: 'Descreva 5 coisas que você pode ver', icon: '👁️', status: Status.Pending },
  { id: 4, text: 'Descreva 4 coisas que você pode tocar', icon: '✋', status: Status.Pending },
  { id: 3, text: 'Descreva 3 coisas que você pode ouvir', icon: '👂', status: Status.Pending },
  { id: 2, text: 'Descreva 2 coisas que você pode cheirar', icon: '👃', status: Status.Pending },
  { id: 1, text: 'Descreva 1 coisa que você pode provar', icon: '👅', status: Status.Pending },
];

export default function GroundingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [senses, setSenses] = useState(SENSES);
  const isBreathingCompleted = senses.every(sense => sense.status === Status.Completed);
  const isRecording = senses.some(sense => sense.status === Status.Recording);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const toggleRecording = () => {
    const nextSense = senses.find(sense => [Status.Pending, Status.Recording].includes(sense.status));

    if (nextSense == null) {
      navigation.navigate('Relaxation');
      return;
    }
    if (isRecording) {
      if (nextSense) {
        setSenses(senses.map(sense => sense.id === nextSense.id ? { ...sense, status: Status.Completed } : sense));
      } else {
        navigation.navigate('Relaxation');
      }
    } else {
      setSenses(senses.map(sense => sense.id === nextSense?.id ? { ...sense, status: Status.Recording } : sense));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Técnica 5-4-3-2-1</Text>
      <Text style={styles.subtitle}>Conecte-se com o ambiente ao seu redor</Text>
      <Text style={styles.subtitle}>Pressione o botão de microfone para começar e descreva em voz alta o que você vê, toca, ouve, cheira e prova.</Text>

      <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {senses.map((sense) => {
          const isCompleted = sense.status === Status.Completed;
          const isRecording = sense.status === Status.Recording;
          return (
            <View
              key={sense.id}
              style={[styles.listItem, isCompleted && styles.listItemSelected, isRecording && styles.listItemRecording]}
            >
              <Text style={styles.icon}>{sense.icon}</Text>
              <Text style={[styles.itemText, isCompleted && styles.itemTextSelected]}>
                {sense.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Rating')}
        >
          <Text style={styles.buttonTextDark}>Eu melhorei</Text>
        </TouchableOpacity>

        {isBreathingCompleted && (
          <TouchableOpacity style={[styles.buttonNext]} onPress={toggleRecording}>
            <Text style={styles.buttonTextDark}>Avançar</Text>
          </TouchableOpacity>
        )}
        {!isBreathingCompleted && (
          <View style={styles.micContainer}>
            <Text style={styles.micLabel}>
              {!isRecording && "Toque para falar"}
              {isRecording && "Ouvindo..."}
            </Text>
            <TouchableOpacity onPress={toggleRecording} activeOpacity={0.8}>
              <Animated.View
                style={[
                  isRecording && styles.micButtonRecording,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Mic color={isRecording ? colors.white : colors.primary} size={32} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: spacing.l,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.l,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: 16,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listItemSelected: {
    backgroundColor: colors.primary!,
  },
  listItemRecording: {
    backgroundColor: colors.success!,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  itemText: {
    fontSize: typography.sizes.medium,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  itemTextSelected: {
    color: colors.white,
  },
  micContainer: {
    alignItems: 'center',
    minWidth: 140,
    height: 64,
    justifyContent: 'center',
  },
  micLabel: {
    fontSize: typography.sizes.small,
    color: colors.textLight,
    marginBottom: spacing.s,
    fontWeight: typography.weights.medium,
  },
  micButton: {
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  micButtonRecording: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 12,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    minHeight: 32,
  },
  micButtonCompleted: {
    backgroundColor: colors.success!,
    borderColor: colors.success!,
    shadowColor: colors.success!,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.l,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.l,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 25,
    minWidth: 140,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonNext: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 25,
    minWidth: 140,
    height: 64,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.medium,
  },
  buttonTextDark: {
    color: colors.text,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.medium,
  }
});
