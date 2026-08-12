import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import StudentListScreen from "@/src/screens/StudentListScreen";
import StudentDetailScreen from "@/src/screens/StudentDetailsScreen";

export type RootStackParamList = {
  Welcome: undefined;
  StudentList: undefined;
  StudentDetail: { studentId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, // We will make custom headers later
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="StudentList" component={StudentListScreen} />
        <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
