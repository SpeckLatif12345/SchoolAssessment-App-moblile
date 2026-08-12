import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AppProvider } from "./src/context/app/appContext";
import { StudentProvider } from "./src/context/student/studentContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StudentProvider>
          <StatusBar style="dark" />
          <AppNavigator />
          <Toast />
        </StudentProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
