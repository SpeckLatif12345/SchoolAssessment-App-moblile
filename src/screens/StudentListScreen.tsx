import React, { useMemo, useState } from "react";
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

import { useStudents } from "@/src/context/student/studentContext";
import { useApp } from "@/src/context/app/appContext";
import { Student } from "@/src/types";
import { RootStackParamList } from "@/src/types";
import { getSubjectStatus } from "@/src/utilis/helperFunction";

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

  const { state: studentState, dispatch } = useStudents();
  const { state: appState } = useApp();

  const [search, setSearch] = useState("");

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

  // handle select student
  const handleSelectStudent = (studentId: string) => {
    navigation.navigate("StudentDetail", { studentId });
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

    dispatch({
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

    dispatch({
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

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}

      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">
          {appState.selectedClass || "Class"}
        </Text>

        <Text className="text-sm text-gray-500 mt-1">
          {studentState.students.length} students
        </Text>

        <TextInput
          className="mt-4 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Search students..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Student List */}

      <FlatList<Student>
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
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
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between shadow-sm"
            activeOpacity={0.7}
            onPress={() => handleSelectStudent(item.id)}
          >
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800">
                {item.name}
              </Text>
            </View>

            {/* Compact subject dots */}
            <View className="flex-row items-center gap-1 mr-3">
              {studentState.subjects.map((subject) => {
                const status = getSubjectStatus(item, subject);

                let dotColor = "bg-gray-300";
                if (status === "incomplete") dotColor = "bg-red-400";
                if (status === "complete") dotColor = "bg-emerald-500";

                return (
                  <View
                    key={subject}
                    className={`w-2 h-2 rounded-full ${dotColor}`}
                  />
                );
              })}
            </View>

            <TouchableOpacity
              className="ml-3 p-2"
              onPress={() => openRemoveModal(item.id, item.name)}
            >
              <Text className="text-red-500 text-sm font-medium">Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
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
    </View>
  );
}
