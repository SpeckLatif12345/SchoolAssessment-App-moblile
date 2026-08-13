import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import StudentListScreen from "@/src/screens/StudentListScreen";
import StudentDetailScreen from "@/src/screens/StudentDetailsScreen";
import { useRestoreSession } from "@/src/hooks/useRestoreSession";
import LoadingScreen from "@/src/screens/LoadingScreen";
import SettingsScreen from "../screens/SettingScreen";

export type RootStackParamList = {
  Welcome: undefined;
  StudentList: undefined;
  StudentDetail: { studentId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { checkingSession, initialScreen } = useRestoreSession();

  if (checkingSession) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialScreen}
      screenOptions={{
        headerShown: false, // We will make custom headers later
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
