import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { useStudents } from "@/src/context/student/studentContext";
import { useApp } from "@/src/context/app/appContext";
import { Student } from "@/src/types";
import { RootStackParamList } from "@/src/types";
import { getSubjectStatus } from "@/src/utilis/helperFunction";
import { Ionicons } from "@expo/vector-icons";

import { useAutoSave } from "@/src/hooks/useAutoSave";

type StudentListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StudentList"
>;

// helper function generateStudentId() {
const generateStudentId = () =>
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Main Component
export default function StudentListScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const navigation = useNavigation<StudentListNavigationProp>();

  const { state: studentState, dispatch: studentDispatch } = useStudents();
  const { state: appState, totalAttendance, selectTerm } = useApp();

  const [search, setSearch] = useState("");

  // auto Save
  const { lastSaved } = useAutoSave({
    className: appState.selectedClass,
    students: studentState.students,
    term: appState.selectedTerm,
    totalAttendance: appState.totalAttendance,
  });

  /*
  // load students if available
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const saved = await AsyncStorage.getItem(appState.selectedClass);

        if (saved && appState.hasImported) return;

        const reportData = saved ? JSON.parse(saved) : {};

        if (reportData.students && reportData.students.length > 0) {
          studentDispatch({
            type: "FETCH_STUDENTS",
            payload: reportData.students,
          });

          if (reportData.totalAttendance) {
            totalAttendance(reportData.totalAttendance);
          }

          if (reportData.term) {
            selectTerm(reportData.term);
          }

          Toast.show({
            type: "success",
            text1: "Previous data restored",
            text2: `${reportData.students.length} students loaded`,
          });
        }
      } catch (error) {
        console.log("Failed to load saved data:", error);
      }
    };

    loadSavedData();
  }, [appState.selectedClass]); */

  // =========================
  // Filter Students
  // =========================

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return studentState.students;

    return studentState.students.filter((student) =>
      student.name.toLowerCase().includes(keyword),
    );
  }, [search, studentState.students]);

  // stopped here next , add attendance compulsory , add promoted to when it third term

  // handle select student
  const handleSelectStudent = (studentId: string) => {
    navigation.navigate("StudentDetail", { studentId });
    setTimeout(() => setSearch(""), 1000);
  };

  // ===== ADD STUDENT =====
  const openAddModal = () => {
    setNewStudentName("");
    setAddModalVisible(true);
  };

  const confirmAddStudent = () => {
    if (!newStudentName.trim()) {
      Toast.show({
        type: "error",
        text1: "Student name is required",
      });
      return;
    }

    const newStudent = {
      id: generateStudentId(),
      name: newStudentName.trim(),
      subjects: {},
      attendance: 0,
      promoted_to: "",
      behaviour: {
        conduct: "",
        attitude: "",
        interest: "",
        class_teacher_remarks: "",
      },
    };

    studentDispatch({
      type: "ADD_STUDENT",
      payload: newStudent,
    });

    setAddModalVisible(false);
    setNewStudentName("");

    Toast.show({
      type: "success",
      text1: "Student added successfully",
    });
  };

  // ===== REMOVE STUDENT =====
  const openRemoveModal = (id: string, name: string) => {
    setStudentToRemove({ id, name });
    setRemoveModalVisible(true);
  };

  const confirmRemoveStudent = () => {
    if (!studentToRemove) return;

    studentDispatch({
      type: "REMOVE_STUDENT",
      payload: studentToRemove.id,
    });

    setRemoveModalVisible(false);
    setStudentToRemove(null);

    Toast.show({
      type: "info",
      text1: "Student removed",
    });
  };

  // save and share

  const handleSaveToStorage = async () => {
    if (!appState.selectedClass) {
      Toast.show({ type: "error", text1: "No class selected" });
      return;
    }

    if (studentState.students.length === 0) {
      Toast.show({ type: "error", text1: "No students to save" });
      return;
    }

    try {
      const reportData = {
        school: "Chrispal International School",
        class: appState.selectedClass,
        students: studentState.students,
        totalAttendance: appState.totalAttendance,
        savedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("activeClass", JSON.stringify(reportData));

      Toast.show({
        type: "success",
        text1: "Saved successfully",
        text2: `${studentState.students.length} students saved`,
      });
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Failed to save data" });
    }
  };

  const handleShare = async () => {
    if (studentState.students.length === 0) {
      Toast.show({ type: "error", text1: "No students to share" });
      return;
    }

    try {
      const reportData = {
        school: "Chrispal International School",
        class: appState.selectedClass,
        students: studentState.students,
        totalAttendance: appState.totalAttendance,
        savedAt: new Date().toISOString(),
      };

      const fileName = `${appState.selectedClass || "Class"}_Report.json`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      // Write the JSON file
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(reportData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 },
      );

      // Check if sharing is available
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Toast.show({
          type: "error",
          text1: "Sharing is not available on this device",
        });
        return;
      }

      // Open share sheet (WhatsApp, Drive, etc.)
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: `Share ${appState.selectedClass} Report`,
        UTI: "public.json",
      });
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Failed to share file" });
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}

      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-2xl font-bold text-gray-800">
            {appState.selectedClass || "Class"}
          </Text>

          {/* Save & Share Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-emerald-500 px-3 py-2 rounded-lg"
              onPress={handleSaveToStorage}
            >
              <Text className="text-white text-xs font-semibold">Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-blue-600 px-3 py-2 rounded-lg"
              onPress={handleShare}
            >
              <Text className="text-white text-xs font-semibold">Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-gray-500 mt-1 ">
              {appState?.selectedTerm || "Term"}
            </Text>

            <Text className="text-sm text-gray-500 mt-1">{` • Total Attendance: ${appState.totalAttendance}`}</Text>
          </View>

          <Text className="text-sm text-gray-500 mt-1">
            {lastSaved ? `  • Last  saved ${lastSaved}` : ""}
          </Text>
        </View>

        <TextInput
          className="mt-4 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Search students..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
        <Text className="text-sm text-gray-500 mt-1">
          {studentState.students.length} students
        </Text>
      </View>

      {/* Student List */}

      <FlatList<Student>
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-lg font-semibold text-gray-500">
              No students yet
            </Text>

            <Text className="text-sm text-gray-400 mt-2 text-center px-8">
              Import students from the Welcome screen or add them manually.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const completedCount = studentState.subjects.filter(
            (subject) => getSubjectStatus(item, subject) === "complete",
          ).length;

          const totalSubjects = studentState.subjects.length;

          // Color of the progress dot
          let progressColor = "bg-gray-300";
          if (completedCount > 0 && completedCount < totalSubjects) {
            progressColor = "bg-blue-500";
          }
          if (completedCount === totalSubjects) {
            progressColor = "bg-emerald-500";
          }

          return (
            <TouchableOpacity
              className="bg-white rounded-xl px-4 py-4 mb-3 flex-row items-center shadow-sm"
              onPress={() => handleSelectStudent(item.id)}
              activeOpacity={0.7}
            >
              {/* Student Name */}
              <Text
                className="text-[15px] font-semibold text-gray-800 flex-1 mr-3"
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {/* Progress Indicator */}
              <View className="flex-row items-center mr-4">
                <View
                  className={`w-2.5 h-2.5 rounded-full mr-1.5 ${progressColor}`}
                />
                <Text className="text-xs text-gray-500 font-medium">
                  {completedCount}/{totalSubjects}
                </Text>
              </View>

              {/* Remove Button */}
              <TouchableOpacity
                onPress={() => openRemoveModal(item.id, item.name)}
              >
                <Text className="text-red-500 text-xs font-medium">Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
      {/* Floating Button */}

      <TouchableOpacity
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-lg"
        activeOpacity={0.8}
        onPress={openAddModal}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>

      {/* ========== ADD STUDENT MODAL ========== */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Add New Student
            </Text>

            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-5"
              placeholder="Enter full name"
              value={newStudentName}
              onChangeText={setNewStudentName}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
                onPress={() => setAddModalVisible(false)}
              >
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
                onPress={confirmAddStudent}
              >
                <Text className="font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========== REMOVE STUDENT MODAL ========== */}
      <Modal
        visible={removeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRemoveModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-2">
              Remove Student
            </Text>
            <Text className="text-gray-600 mb-6">
              Are you sure you want to remove{" "}
              <Text className="font-semibold">{studentToRemove?.name}</Text>?
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
                onPress={() => setRemoveModalVisible(false)}
              >
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-xl items-center"
                onPress={confirmRemoveStudent}
              >
                <Text className="font-semibold text-white">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-6 pt-3">
        <View className="flex-row items-center justify-center">
          {/* Settings Button - Center */}
          <TouchableOpacity
            className="items-center justify-center"
            onPress={() => navigation.navigate("Settings" as never)}
            activeOpacity={0.7}
          >
            <View className="bg-gray-100 w-14 h-14 rounded-full items-center justify-center mb-1">
              <Ionicons name="settings-outline" size={26} color="#374151" />
            </View>
            <Text className="text-xs text-gray-600 font-medium">Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
