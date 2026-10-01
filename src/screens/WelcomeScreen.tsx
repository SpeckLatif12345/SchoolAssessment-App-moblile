import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "@/src/context/app/appContext";
import { useStudents } from "@/src/context/student/studentContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/AppNavigator";
import { useTheme } from "@/src/hooks/useTheme";

export default function WelcomeScreen() {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDark, colors } = useTheme();

  const {
    state: appState,
    dispatch: appDispatch,
    chooseClass,
    totalAttendance,
    selectTerm,
  } = useApp();

  const { state: studentState, dispatch: studentDispatch } = useStudents();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Function to handle the continue button press
  const handleContinue = () => {
    if (!appState.selectedClass) {
      Toast.show({
        type: "error",
        text1: "Please select a class first",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      navigation.replace("StudentList");
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    const saveAttendance = async () => {
      if (!appState?.selectedClass) return;

      try {
        const saved = await AsyncStorage.getItem(appState.selectedClass);
        if (saved) {
          const reportData = JSON.parse(saved);
          if (reportData.class === appState.selectedClass) {
            const updated = {
              ...reportData,
              totalAttendance: appState.totalAttendance ?? 0,
              savedAt: new Date().toISOString(),
            };
            await AsyncStorage.setItem(
              appState.selectedClass,
              JSON.stringify(updated),
            );
          }
        }
      } catch (e) {
        console.log("Error saving attendance", e);
      }
    };

    saveAttendance();
  }, [appState?.totalAttendance]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerClassName="flex-grow bg-gray-100 justify-center p-5"
        className="flex-1"
      >
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-2xl font-semibold text-center mb-2 text-gray-800">
            Welcome, Teacher 👋
          </Text>
          <Text className="text-gray-500 text-center mb-6 text-[15px]">
            Please select your class to get started
          </Text>

          {/* Class Picker */}
          <View className="border border-gray-300 rounded-lg mb-5 overflow-hidden">
            <Picker
              selectedValue={appState.selectedClass}
              onValueChange={(value: any) => chooseClass(value)}
              style={{
                height: 50,
                color: colors.inputText,
                backgroundColor: colors.inputBackground,
                width: "100%",
              }}
            >
              <Picker.Item label="Select your class" value="" />
              {appState.class_names.map((name: string) => (
                <Picker.Item key={name} label={name} value={name} />
              ))}
            </Picker>
          </View>

          {/* Term Picker */}
          <View className="border border-gray-300 rounded-lg mb-5  overflow-hidden">
            <Picker
              selectedValue={appState.selectedTerm}
              onValueChange={(value: any) => selectTerm(value)}
              style={{
                height: 50,
                color: colors.inputText,
                backgroundColor: colors.inputBackground,
                width: "100%",
              }}
            >
              <Picker.Item label="Select Term" value="" />
              {appState.term_names.map((name: string) => (
                <Picker.Item key={name} label={name} value={name} />
              ))}
            </Picker>
          </View>

          {/* Total Attendance */}
          <View className="items-center mb-7">
            <Text className="text-[15px] font-semibold text-gray-700 mb-2">
              Total Attendance
            </Text>
            <TextInput
              className="w-16 border border-gray-300 rounded-lg py-2 text-center text-base font-semibold text-gray-800"
              keyboardType="numeric"
              value={String(appState.totalAttendance)}
              onChangeText={(text) => {
                if (!appState.selectedClass) {
                  Toast.show({
                    type: "error",
                    text1: "Please select a class first",
                  });
                  return;
                }
                const num = Number(text) || 0;
                totalAttendance(num);
              }}
              maxLength={3}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            className={`py-3.5 rounded-xl items-center ${
              appState.selectedClass && appState.selectedTerm
                ? "bg-blue-600"
                : "bg-gray-400"
            }`}
            onPress={handleContinue}
            disabled={
              (!appState.selectedClass && !appState.selectedTerm) || loading
            }
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
