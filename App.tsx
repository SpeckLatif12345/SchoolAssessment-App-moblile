import React, { useEffect, useState } from "react";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from "./src/context/app/appContext";
import { StudentProvider } from "./src/context/student/studentContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StudentProvider>
            <StatusBar style="dark" />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <Toast />
          </StudentProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
