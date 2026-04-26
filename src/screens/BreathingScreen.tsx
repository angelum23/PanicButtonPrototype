import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Breathing'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Wave configuration — 3 layers with different heights, colors and speeds
const WAVE_CONFIGS = [
  { baseHeight: 120, color: 'rgba(188, 160, 220, 0.25)', riseExtra: 80, delay: 0 },
  { baseHeight: 80, color: 'rgba(188, 160, 220, 0.18)', riseExtra: 100, delay: 150 },
  { baseHeight: 50, color: 'rgba(188, 160, 220, 0.12)', riseExtra: 120, delay: 300 },
];

export default function BreathingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [phase, setPhase] = useState<'Respire' | 'Inspire' | 'Expire'>('Respire');
  const [seconds, setSeconds] = useState(2);
  const [timeLeft, setTimeLeft] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  const scale = useRef(new Animated.Value(1.5)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  // Wave animated values: one per wave layer
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  // Horizontal sway for organic feel
  const sway1 = useRef(new Animated.Value(0)).current;
  const sway2 = useRef(new Animated.Value(0)).current;
  const sway3 = useRef(new Animated.Value(0)).current;

  const waveRefs = [wave1, wave2, wave3];
  const swayRefs = [sway1, sway2, sway3];

  // Start a continuous subtle sway animation on mount
  useEffect(() => {
    const swayAnimations = swayRefs.map((sway, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(sway, {
            toValue: 1,
            duration: 3000 + i * 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sway, {
            toValue: -1,
            duration: 3000 + i * 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sway, {
            toValue: 0,
            duration: 3000 + i * 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );
    swayAnimations.forEach(a => a.start());
    return () => swayAnimations.forEach(a => a.stop());
  }, []);

  // Animate waves when phase changes
  useEffect(() => {
    const isInspire = phase === 'Inspire';
    const isExpire = phase === 'Expire';
    const isIntro = phase === 'Respire';

    const targetValue = isInspire ? 1 : isExpire ? 0 : 0;
    const waveDuration = isIntro ? 3000 : seconds * 1000;

    const waveAnimations = waveRefs.map((wave, i) =>
      Animated.timing(wave, {
        toValue: targetValue,
        duration: waveDuration + WAVE_CONFIGS[i].delay,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, waveAnimations).start();
  }, [phase, seconds]);

  // Main breathing animation
  useEffect(() => {
    let currentSeconds = seconds;
    let currentPhase = phase;
    let currentDirection = direction;

    let toValue = 1;
    let duration = 3000;

    if (currentPhase === 'Respire') {
      toValue = 1;
      duration = 3000;
    } else {
      toValue = currentPhase === 'Inspire' ? 1.5 : 1;
      duration = currentSeconds * 1000;
    }

    const initialTimeLeft = Math.ceil(duration / 1000);
    setTimeLeft(initialTimeLeft);

    let currentIntervalTimeLeft = initialTimeLeft;

    const interval = setInterval(() => {
      currentIntervalTimeLeft -= 1;
      if (currentIntervalTimeLeft > 0) {
        setTimeLeft(currentIntervalTimeLeft);
      }
    }, 1000);

    const animate = () => {
      Animated.parallel([
        Animated.timing(scale, {
          toValue,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        clearInterval(interval);

        if (finished) {
          if (currentPhase === 'Respire') {
            currentPhase = 'Inspire';
          } else if (currentPhase === 'Inspire') {
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
        }
      });
    };

    animate();

    return () => {
      clearInterval(interval);
      scale.stopAnimation();
      opacity.stopAnimation();
    };
  }, [seconds, phase, direction]);

  const renderWaves = () => {
    return WAVE_CONFIGS.map((config, i) => {
      const waveAnim = waveRefs[i];
      const swayAnim = swayRefs[i];

      const translateY = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -config.riseExtra],
      });

      const waveOpacity = waveAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 0.85, 1],
      });

      const translateX = swayAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-8 - i * 3, 0, 8 + i * 3],
      });

      const scaleX = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
      });

      return (
        <Animated.View
          key={i}
          style={[
            styles.wave,
            {
              height: config.baseHeight + config.riseExtra,
              backgroundColor: config.color,
              bottom: -config.riseExtra + (i * 10),
              borderTopLeftRadius: 80 + i * 30,
              borderTopRightRadius: 80 + i * 30,
              transform: [
                { translateY },
                { translateX },
                { scaleX },
              ],
              opacity: waveOpacity,
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.wavesContainer} pointerEvents="none">
        {renderWaves()}
      </View>

      <Text style={styles.title}>Respiração Controlada</Text>
      <Text style={styles.subtitle}>Acompanhe o círculo</Text>

      <View style={styles.animationContainer}>
        <Animated.View style={[styles.circle, { transform: [{ scale }], opacity }]} />
        <Text style={styles.instructionText}>
          {phase}
        </Text>
        <Text style={styles.secondsText}>
          {timeLeft}s
        </Text>
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
    overflow: 'hidden',
  },
  wavesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
    zIndex: 0,
  },
  wave: {
    position: 'absolute',
    left: -20,
    right: -20,
    width: SCREEN_WIDTH + 40,
  },
  title: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    zIndex: 1,
  },
  subtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    marginTop: spacing.s,
    zIndex: 1,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
    textAlign: 'center',
    paddingHorizontal: spacing.m,
  },
  prePhaseText: {
    position: 'absolute',
    transform: [{ translateY: -200 }],
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.m,
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
    zIndex: 1,
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
