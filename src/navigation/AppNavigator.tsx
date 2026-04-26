import React from 'react';
import { CommonActions } from '@react-navigation/native';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabParamList, EmergencyStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import BreathingScreen from '../screens/BreathingScreen';
import GroundingScreen from '../screens/GroundingScreen';
import RelaxationScreen from '../screens/RelaxationScreen';
import RatingScreen from '../screens/RatingScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const EmergencyStack = createNativeStackNavigator<EmergencyStackParamList>();

function EmergencyStackNavigator() {
  return (
    <EmergencyStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <EmergencyStack.Screen name="EmergencyHome" component={EmergencyScreen} />
      <EmergencyStack.Screen name="Breathing" component={BreathingScreen} />
      <EmergencyStack.Screen name="Grounding" component={GroundingScreen} />
      <EmergencyStack.Screen name="Relaxation" component={RelaxationScreen} />
      <EmergencyStack.Screen name="Rating" component={RatingScreen} />
    </EmergencyStack.Navigator>
  );
}

// Custom tab bar icon component
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[tabIconStyles.container, focused && tabIconStyles.focused]}>
      <Text style={tabIconStyles.emoji}>{emoji}</Text>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focused: {
    backgroundColor: 'rgba(188, 160, 220, 0.2)',
  },
  emoji: {
    fontSize: 22,
  },
});

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 84 : 84,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EmergencyTab"
        component={EmergencyStackNavigator}
        options={{
          tabBarLabel: 'Emergência',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🚨" focused={focused} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'EmergencyTab',
                    state: {
                      routes: [{ name: 'EmergencyHome' }],
                    },
                  },
                ],
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="RegistrationTab"
        component={RegistrationScreen}
        options={{
          tabBarLabel: 'Cadastro',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
