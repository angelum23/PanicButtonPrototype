import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { Mic } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Grounding'>;

const SENSES = [
  { id: 5, text: '5 coisas que você pode ver', icon: '👁️' },
  { id: 4, text: '4 coisas que você pode tocar', icon: '✋' },
  { id: 3, text: '3 coisas que você pode ouvir', icon: '👂' },
  { id: 2, text: '2 coisas que você pode cheirar', icon: '👃' },
  { id: 1, text: '1 coisa que você pode provar', icon: '👅' },
];

export default function GroundingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
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
    if (isRecording) {
      setIsRecording(false);
      const nextSense = SENSES.find(sense => !completedSteps.includes(sense.id));
      if (nextSense) {
        setCompletedSteps([...completedSteps, nextSense.id]);
      }
    } else {
      setIsRecording(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Técnica 5-4-3-2-1</Text>
      <Text style={styles.subtitle}>Conecte-se com o ambiente ao seu redor</Text>

      <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {SENSES.map((sense) => {
          const isCompleted = completedSteps.includes(sense.id);
          return (
            <View 
              key={sense.id} 
              style={[styles.listItem, isCompleted && styles.listItemSelected]}
            >
              <Text style={styles.icon}>{sense.icon}</Text>
              <Text style={[styles.itemText, isCompleted && styles.itemTextSelected]}>
                {sense.text}
              </Text>
            </View>
          );
        })}

        <View style={styles.micContainer}>
          <Text style={styles.micLabel}>
            {isRecording ? "Ouvindo... Toque para concluir e avançar" : "Toque para falar e avançar"}
          </Text>
          <TouchableOpacity onPress={toggleRecording} activeOpacity={0.8}>
            <Animated.View 
              style={[
                styles.micButton, 
                isRecording && styles.micButtonRecording,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Mic color={isRecording ? colors.white : colors.primary} size={32} />
            </Animated.View>
          </TouchableOpacity>
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
    backgroundColor: colors.primary,
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
    marginTop: spacing.xl,
    marginBottom: spacing.m,
  },
  micLabel: {
    fontSize: typography.sizes.small,
    color: colors.textLight,
    marginBottom: spacing.s,
    fontWeight: typography.weights.medium,
  },
  micButton: {
    width: 64,
    height: 64,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingHorizontal: spacing.l,
    width: '100%',
    justifyContent: 'center',
    marginTop: spacing.l,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
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
