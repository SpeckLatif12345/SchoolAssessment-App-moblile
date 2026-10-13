import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

import { useStudents } from "@/src/context/student/studentContext";
import { useApp } from "@/src/context/app/appContext";
import { Student } from "@/src/types";
import { RootStackParamList } from "@/src/types";
import { getSubjectStatus } from "@/src/utilis/helperFunction";
import { Ionicons } from "@expo/vector-icons";

import { useAutoSave } from "@/src/hooks/useAutoSave";
import { useSubjectsByClass } from "@/src/hooks/useSubjectsByClass";

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
  const { state: appState } = useApp();
  const { availableSubjects, totalSubjects } = useSubjectsByClass();

  const [search, setSearch] = useState("");

  // auto Save
  const { lastSaved } = useAutoSave({
    className: appState.selectedClass,
    students: studentState.students,
    term: appState.selectedTerm,
    totalAttendance: appState.totalAttendance,
  });

  // draggable button
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");
  const BUTTON_SIZE = 56;
  const MARGIN = 24;
  const STORAGE_KEY = "fab_position";

  // Inside your StudentListScreen component:
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Load saved position when screen opens
  useEffect(() => {
    const loadPosition = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { x, y } = JSON.parse(saved);
        translateX.value = x;
        translateY.value = y;
      }
    };
    loadPosition();
  }, []);

  // Save position
  const savePosition = async (x: number, y: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
    } catch (e) {
      console.log("Failed to save FAB position", e);
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      const maxX = SCREEN_WIDTH / 2 - BUTTON_SIZE / 2 - MARGIN;

      // Leave space for the bottom Settings bar (~100px)
      const maxY = SCREEN_HEIGHT / 2 - BUTTON_SIZE / 2 - 130;
      const minY = -(SCREEN_HEIGHT / 2 - BUTTON_SIZE / 2 - 80);

      if (translateX.value > maxX) translateX.value = maxX;
      if (translateX.value < -maxX) translateX.value = -maxX;
      if (translateY.value > maxY) translateY.value = maxY;
      if (translateY.value < minY) translateY.value = minY;

      runOnJS(savePosition)(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Filter students based on search input
  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return studentState.students;

    return studentState.students.filter((student) =>
      student.name.toLowerCase().includes(keyword),
    );
  }, [search, studentState.students]);

  // handle select student
  const handleSelectStudent = (studentId: string) => {
    navigation.navigate("StudentDetail", { studentId });
    setTimeout(() => setSearch(""), 1000);
  };

  //  handle add student
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

  //  handle remove student
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

  // handle share
  const handleShare = async () => {
    if (studentState.students.length === 0) {
      Toast.show({ type: "error", text1: "No students to share" });
      return;
    }

    try {
      const payload = studentState.students.map((student) => {
        const payloadSubjects: Record<
          string,
          { classPercent: number; examPercent: number }
        > = {};
        const subjects = student.subjects || {};

        Object.keys(subjects).forEach((subjectName) => {
          const data = subjects[subjectName] || {};
          payloadSubjects[subjectName] = {
            classPercent: Number(data.classPercent) || 0,
            examPercent: Number(data.examPercent) || 0,
          };
        });

        return {
          ...student,
          subjects: payloadSubjects,
        };
      });

      const reportData = {
        school: "Chrispal International School",
        class: appState.selectedClass,
        students: payload,
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
      Toast.show({
        type: "error",
        text1: "Failed to share file , Please try again",
      });
    }
  };

  //   Runs every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      studentDispatch({
        type: "SET_SUBJECT",
        payload: availableSubjects[0] || "Mathematics",
      });
    }, [studentDispatch, availableSubjects]),
  );

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
          const completedCount = availableSubjects.filter(
            (subject) => getSubjectStatus(item, subject) === "complete",
          ).length;

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
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            animatedStyle,
            {
              position: "absolute",
              bottom: 110, // ← sits above the Settings bar
              right: 24,
              zIndex: 100, // ← above everything
              elevation: 100, // Android
            },
          ]}
        >
          <TouchableOpacity
            className="w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-lg"
            activeOpacity={0.8}
            onPress={openAddModal}
          >
            <Text className="text-white text-3xl font-light">+</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

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
        <View className="flex-1 bg-black/50 justify-center items-center px-6  z-50">
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
