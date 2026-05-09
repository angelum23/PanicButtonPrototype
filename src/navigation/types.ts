import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  HomeTab: undefined;
  EmergencyTab: NavigatorScreenParams<EmergencyStackParamList>;
  RegistrationTab: undefined;
};

export type EmergencyStackParamList = {
  EmergencyHome: undefined;
  Breathing: undefined;
  Grounding: { breathingSessionId?: number } | undefined;
  Relaxation: { groundingSessionId?: number } | undefined;
  Rating: {
    breathingSessionId?: number;
    groundingSessionId?: number;
    relaxationSessionId?: number;
  } | undefined;
  UsageReport: undefined;
};

export type RootStackParamList = EmergencyStackParamList;
