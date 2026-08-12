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
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as XLSX from "xlsx";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "@/src/context/app/appContext";
import { useStudents } from "@/src/context/student/studentContext";

export default function WelcomeScreen() {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    state: appState,
    dispatch: appDispatch,
    chooseClass,
    totalAttendance,
  } = useApp();

  const { state: studentState, dispatch: studentDispatch } = useStudents();
  const navigation = useNavigation();

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
      navigation.navigate("StudentList" as never);
      setLoading(false);
    }, 1200);
  };

  const importStudents = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/plain",
          "text/csv",
          "application/json",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: false, // important
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      const name = file.name || "unknown";
      const ext = name.split(".").pop()?.toLowerCase() || "";

      // Make sure we have a valid URI
      let fileUri = file.uri;

      // On some Android devices we need to copy the file again
      if (Platform.OS === "android") {
        const newPath = FileSystem.cacheDirectory + name;
        await FileSystem.copyAsync({
          from: file.uri,
          to: newPath,
        });
        fileUri = newPath; // stopped here *************
      }

      appDispatch({ type: "SET_IMPORT_STATUS", payload: true });

      let names: string[] = [];

      switch (ext) {
        case "txt": {
          const text = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          names = text
            .split("\n")
            .map((n) => n.trim())
            .filter(Boolean);
          break;
        }

        case "csv":
        case "xls":
        case "xlsx": {
          const data = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const workbook = XLSX.read(data, { type: "base64" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet);
          names = rows.map((row: any) => {
            const value = Object.values(row)[0];
            return String(value).trim();
          });
          break;
        }

        case "json": {
          const jsonText = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const data = JSON.parse(jsonText);

          studentDispatch({
            type: "FETCH_STUDENTS",
            payload: data.students || [],
          });

          setFileName(name);
          appDispatch({
            type: "SET_TOTAL_ATTENDANCE",
            payload: data.totalAttendance || 0,
          });

          Toast.show({
            type: "success",
            text1: `${data.students?.length || 0} students imported successfully`,
          });
          return;
        }

        case "docx": {
          Toast.show({
            type: "info",
            text1: "DOCX support is limited on mobile",
            text2: "Please use TXT, CSV, XLSX or JSON",
          });
          return;
        }

        default:
          Toast.show({ type: "error", text1: "Unsupported file type" });
          return;
      }

      // Create student objects
      const studentObjects = names.map((studentName) => ({
        id: `id-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: studentName,
        subjects: {},
        attendance: 0,
        promoted_to: "",
        behaviour: {
          conduct: "",
          attitude: "",
          interest: "",
          class_teacher_remarks: "",
        },
      }));

      studentDispatch({
        type: "FETCH_STUDENTS",
        payload: studentObjects,
      });

      setFileName(name);

      Toast.show({
        type: "success",
        text1: `${studentObjects.length} students imported successfully`,
      });
    } catch (error) {
      console.error("Import error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to import file",
        text2: "Try using a TXT or CSV file",
      });
    }
  };

  /*
  useEffect(() => {
    const saveAttendance = async () => {
      if (!appState?.selectedClass) return;

      try {
        // Safety check
        if (!AsyncStorage) {
          console.log("AsyncStorage is not available");
          return;
        }

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
  }, [appState?.totalAttendance, appState?.selectedClass]); */

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
              style={{ height: 50, width: "100%" }}
            >
              <Picker.Item label="Select your class" value="" />
              {appState.class_names.map((name: string) => (
                <Picker.Item key={name} label={name} value={name} />
              ))}
            </Picker>
          </View>

          {/* Import Students */}
          <View className="mb-5">
            <Text className="text-[15px] font-semibold mb-2 text-gray-700">
              Import Students
            </Text>

            <TouchableOpacity
              className="bg-gray-100 border border-gray-300 rounded-lg py-3.5 items-center"
              onPress={importStudents}
            >
              <Text className="text-[15px] font-medium text-gray-800">
                Choose File
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-gray-400 mt-2">
              Supported: TXT, CSV, XLSX, XLS, JSON, DOCX
            </Text>

            {fileName ? (
              <Text className="mt-2.5 text-sm text-emerald-600 font-medium">
                📄 {fileName}
                {studentState.students.length > 0 && (
                  <Text className="text-blue-600">
                    {" "}
                    • {studentState.students.length} students imported
                  </Text>
                )}
              </Text>
            ) : null}
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
              appState.selectedClass ? "bg-blue-600" : "bg-gray-400"
            }`}
            onPress={handleContinue}
            disabled={!appState.selectedClass || loading}
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
