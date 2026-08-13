import React, { useEffect, useState } from "react";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from "./src/context/app/appContext";
import { StudentProvider } from "./src/context/student/studentContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
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
  );
}
