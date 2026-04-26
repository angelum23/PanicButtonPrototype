import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  HomeTab: undefined;
  EmergencyTab: NavigatorScreenParams<EmergencyStackParamList>;
  RegistrationTab: undefined;
};

export type EmergencyStackParamList = {
  EmergencyHome: undefined;
  Breathing: undefined;
  Grounding: undefined;
  Relaxation: undefined;
  Rating: undefined;
};

export type RootStackParamList = EmergencyStackParamList;
