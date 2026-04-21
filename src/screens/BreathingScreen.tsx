import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Breathing'>;

export default function BreathingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [phase, setPhase] = useState<'Inspire' | 'Expire'>('Inspire');
  const [seconds, setSeconds] = useState(1);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    let currentSeconds = seconds;
    let currentPhase = phase;
    let currentDirection = direction;

    const animate = () => {
      const toValue = currentPhase === 'Inspire' ? 1.5 : 1;
      const baseDurationMs = currentSeconds * 1000;
      const duration = currentPhase === 'Inspire' ? baseDurationMs : baseDurationMs * 0.7;

      Animated.parallel([
        Animated.timing(scale, {
          toValue,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: currentPhase === 'Inspire' ? 1 : 0.7,
          duration,
          useNativeDriver: true,
        })
      ]).start(() => {
        if (currentPhase === 'Inspire') {
          currentPhase = 'Expire';
        } else {
          currentPhase = 'Inspire';
          if (currentDirection === 'up') {
            if (currentSeconds < 10) {
              currentSeconds += 1;
            } else {
              currentDirection = 'down';
              currentSeconds -= 1;
            }
          } else {
            if (currentSeconds > 1) {
              currentSeconds -= 1;
            } else {
              return;
            }
          }
        }

        setPhase(currentPhase);
        setSeconds(currentSeconds);
        setDirection(currentDirection);
      });
    };

    animate();

    return () => {
      scale.stopAnimation();
      opacity.stopAnimation();
    };
  }, [seconds, phase, direction]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Respiração Controlada</Text>
      <Text style={styles.subtitle}>Acompanhe o círculo</Text>

      <View style={styles.animationContainer}>
        <Animated.View style={[styles.circle, { transform: [{ scale }], opacity }]} />
        <Text style={styles.instructionText}>{phase}</Text>
        <Text style={styles.secondsText}>{seconds}s</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Rating')}
        >
          <Text style={styles.buttonTextDark}>Eu melhorei</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Grounding')}
        >
          <Text style={styles.buttonText}>Próximo passo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
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
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    position: 'absolute',
  },
  instructionText: {
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
    color: colors.text,
    zIndex: 1,
  },
  secondsText: {
    fontSize: typography.sizes.large,
    color: colors.text,
    zIndex: 1,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingHorizontal: spacing.l,
    width: '100%',
    justifyContent: 'center',
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
