import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import BreathingScreen from '../screens/BreathingScreen';
import GroundingScreen from '../screens/GroundingScreen';
import RelaxationScreen from '../screens/RelaxationScreen';
import RatingScreen from '../screens/RatingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="Grounding" component={GroundingScreen} />
      <Stack.Screen name="Relaxation" component={RelaxationScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
    </Stack.Navigator>
  );
}
