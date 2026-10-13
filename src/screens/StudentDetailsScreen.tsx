import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useStudents } from "@/src/context/student/studentContext";
import { useApp } from "@/src/context/app/appContext";
import { Picker } from "@react-native-picker/picker";
import { useSubjectsByClass } from "@/src/hooks/useSubjectsByClass";
import { Student } from "../types";
import { useTheme } from "@/src/hooks/useTheme";
import Toast from "react-native-toast-message";

const ScoreInput = ({
  studentId,
  label,
  field,
  value,
  onChange,
  max,
}: {
  studentId: string;
  label: string;
  field: string;
  value: string | number;
  onChange: (id: string, field: string, value: number) => void;
  max: number;
}) => {
  const [flashRed, setFlashRed] = useState(false);

  const handleChange = (text: string) => {
    setFlashRed(false);

    // Allow empty while typing
    if (text === "") {
      onChange(studentId, field, 0);
      return;
    }

    // Digits only
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned === "") {
      onChange(studentId, field, 0);
      return;
    }

    let num = Number(cleaned);

    if (num > max) {
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 500);
      onChange(studentId, field, 0);
      return;
    }
    if (num <= max) {
      onChange(studentId, field, num);
      return;
    }
  }; // adding auto generate scores

  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-gray-700 text-[15px] flex-1">{label}</Text>

      <TextInput
        className="w-20 rounded-lg py-2 text-center text-base font-semibold"
        style={{
          borderWidth: 1,
          borderColor: flashRed ? "#ef4444" : "#d1d5db", // red-500 / gray-300
          backgroundColor: flashRed ? "#fef2f2" : "#ffffff",
          color: flashRed ? "#dc2626" : "#111827",
        }}
        keyboardType="numeric"
        value={String(value ?? 0)}
        onChangeText={handleChange}
        maxLength={3}
        selectTextOnFocus
      />

      <Text className="text-gray-400 text-sm ml-2 w-10">/{max}</Text>
    </View>
  );
};

export default function StudentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { studentId } = route.params as { studentId: string };
  const { isDark, colors } = useTheme();

  const { state: studentState, dispatch } = useStudents();
  const { state: appState } = useApp();
  const { availableSubjects, currentSubject } = useSubjectsByClass();

  const student: Student | undefined = useMemo(() => {
    return studentState.students.find((s) => s.id === studentId);
  }, [studentId, studentState.students]);

  const data = useMemo(
    () => student?.subjects?.[currentSubject] || {},
    [student, studentState.students, studentId, currentSubject],
  );

  // Calculations
  const totalAB = useMemo(
    () => data.classPercent + data.examPercent,
    [data, studentState.students, studentId, currentSubject],
  );

  // Handle score change for a student
  function handleScoreChange(id: string, field: string, value: number) {
    dispatch({
      type: "SET_SCORE",
      payload: { id, field, value },
    });
  }
  // handle  student attendance change
  function handleAttendanceChange(id: string, value: number) {
    dispatch({
      type: "SET_STUDENT_ATTENDANCE",
      payload: { id, value },
    });
  }

  // handle promotion change
  function handlePromotedToChange(id: string, value: string) {
    dispatch({
      type: "SET_PROMOTED_TO",
      payload: { id, value },
    });
  }

  // handle behaviour change
  function handleBehaviourChange(id: string, field: string, value: string) {
    dispatch({
      type: "SET_BEHAVIOUR",
      payload: { id, field, value },
    });
  }

  // determine badge class based on total score
  function totalBadgeClass(total: number) {
    if (total >= 80) return "text-emerald-600 ";

    if (total >= 65) return " text-blue-800 ";

    if (total >= 50) return " text-amber-800 ";

    return " text-rose-800";
  }

  //  handle auto generate scores for continuous assessment
  const generateContinuousAssessment = () => {
    if (!studentId) return;

    const scores = [
      { field: "ProjectWork", value: 20 },
      { field: "ClassWork", value: 40 },
      { field: "ClassTest1", value: 10 },
      { field: "ClassTest2", value: 10 },
      { field: "HomeWork", value: 20 },
    ];

    scores.forEach(({ field, value }) => {
      dispatch({
        type: "SET_SCORE",
        payload: {
          id: studentId,
          field,
          value,
        },
      });
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-100"
    >
      {/* Header */}
      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 text-base font-medium">Back</Text>
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          {student?.name}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        {/* Subject Selector */}
        <View className="bg-white rounded-2xl p-4 mb-5">
          <Text className="text-sm text-gray-500 mb-2">Select Subject</Text>
          <View className="border border-gray-300 rounded-lg overflow-hidden">
            <Picker
              selectedValue={currentSubject}
              onValueChange={(value) => {
                dispatch({
                  type: "SET_SUBJECT",
                  payload: value,
                });
              }}
              style={{
                height: 50,
                color: isDark ? "#FFFFFF" : "#111827",
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              }}
            >
              {availableSubjects.map((subject) => (
                <Picker.Item key={subject} label={subject} value={subject} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Continuous Assessment */}
        <View className="bg-white rounded-2xl p-5 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Continuous Assessment
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-3 py-1.5 mb-4 rounded-lg"
              onPress={generateContinuousAssessment}
            >
              <Text className="text-white text-xs font-semibold">Auto</Text>
            </TouchableOpacity>
          </View>

          <ScoreInput
            studentId={studentId}
            label="Project Work"
            field="ProjectWork"
            value={data.ProjectWork ?? 0}
            onChange={handleScoreChange}
            max={20}
          />
          <ScoreInput
            studentId={studentId}
            label="Class Work"
            field="ClassWork"
            value={data.ClassWork ?? 0}
            onChange={handleScoreChange}
            max={40}
          />
          <ScoreInput
            studentId={studentId}
            label="Class Test 1"
            field="ClassTest1"
            value={data.ClassTest1 ?? 0}
            onChange={handleScoreChange}
            max={10}
          />
          <ScoreInput
            studentId={studentId}
            label="Class Test 2"
            field="ClassTest2"
            value={data.ClassTest2 ?? 0}
            onChange={handleScoreChange}
            max={10}
          />
          <ScoreInput
            studentId={studentId}
            label="Home Work"
            field="HomeWork"
            value={data.HomeWork ?? 0}
            onChange={handleScoreChange}
            max={20}
          />

          <View className="border-t border-gray-200 mt-3 pt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Total (100)</Text>
              <Text className="font-bold text-blue-600">
                {data.totalA || 0}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal A (50%)</Text>
              <Text className="font-bold text-orange-500">
                {Math.round(data.classPercent) || 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Exam */}
        <View className="bg-white rounded-2xl p-5 mb-5">
          <Text className="text-lg font-bold text-gray-800 mb-4">Exam</Text>

          <ScoreInput
            studentId={studentId}
            label="Exam Score"
            field="examScore"
            value={data.examScore ?? 0}
            onChange={handleScoreChange}
            max={100}
          />

          <View className="border-t border-gray-200 mt-3 pt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Exam B (50%)</Text>
              <Text className="font-bold text-orange-500">
                {Math.round(data.examPercent) || 0}%
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-semibold text-gray-800">Total A + B</Text>
              <Text className={`font-bold ${totalBadgeClass(totalAB)} text-lg`}>
                {Math.round(totalAB) || 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Attendance & Promotion */}
        <View className="bg-white rounded-2xl p-5 mb-5">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Attendance & Promotion
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-700 text-[15px]">Attendance (%)</Text>
            <TextInput
              className="w-20 border border-gray-300 rounded-lg py-2 text-center text-base font-semibold"
              keyboardType="numeric"
              value={String(student?.attendance || 0)}
              onChangeText={(text) =>
                handleAttendanceChange(studentId, Number(text) || 0)
              }
              maxLength={3}
            />
          </View>

          <Text className="text-gray-700 text-[15px] mb-2">Promoted To</Text>
          <View className="border border-gray-300 rounded-lg overflow-hidden">
            <Picker
              selectedValue={student?.promoted_to || ""}
              onValueChange={(value) =>
                handlePromotedToChange(studentId, value)
              }
              style={{
                height: 50,
                color: isDark ? "#FFFFFF" : "#111827",
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              }}
            >
              <Picker.Item label="Select class" value="" />
              {appState.class_names.map((name) => (
                <Picker.Item key={name} label={name} value={name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Behaviour */}
        <View className="bg-white rounded-2xl p-5 mb-5">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Behaviour
          </Text>

          <Text className="text-gray-700 text-[15px] mb-1">Conduct</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2.5 mb-3 text-base text-gray-900 "
            value={student?.behaviour?.conduct || ""}
            onChangeText={(text) =>
              handleBehaviourChange(studentId, "conduct", text)
            }
            placeholder="optional"
            placeholderTextColor="#6B7280"
          />

          <Text className="text-gray-700 text-[15px] mb-1">Attitude</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2.5 mb-3 text-base text-gray-900"
            placeholder="optional"
            placeholderTextColor="#6B7280"
            value={student?.behaviour?.attitude || ""}
            onChangeText={(text) =>
              handleBehaviourChange(studentId, "attitude", text)
            }
          />

          <Text className="text-gray-700 text-[15px] mb-1">Interest</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2.5 mb-3 text-base text-gray-900"
            placeholder="optional"
            placeholderTextColor="#6B7280"
            value={student?.behaviour?.interest || ""}
            onChangeText={(text) =>
              handleBehaviourChange(studentId, "interest", text)
            }
          />

          <Text className="text-gray-700 text-[15px] mb-1">
            Class Teacher's Remarks
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900"
            value={student?.behaviour?.class_teacher_remarks || ""}
            onChangeText={(text) =>
              handleBehaviourChange(studentId, "class_teacher_remarks", text)
            }
            placeholder="optional"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
