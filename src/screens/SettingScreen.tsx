import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useApp } from "@/src/context/app/appContext";
import { useStudents } from "@/src/context/student/studentContext";
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    state: appState,
    chooseClass,
    totalAttendance,
    dispatch: appDispatch,
  } = useApp();

  const { dispatch: studentDispatch } = useStudents();

  const [resetModalVisible, setResetModalVisible] = useState(false);

  function handleTermChange(value: string) {
    appDispatch({
      type: "SET_TERM",
      payload: value,
    });
  }

  const handleResetAll = () => {
    studentDispatch({ type: "RESET_ALL_STUDENT_FIELDS" });
    setResetModalVisible(false);

    Toast.show({
      type: "success",
      text1: "All student fields have been reset",
    });
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 text-base">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-800">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {/* Class */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-sm font-semibold text-gray-500 mb-2">
            CLASS
          </Text>
          <View className="border border-gray-300 rounded-xl overflow-hidden">
            <Picker
              selectedValue={appState.selectedClass}
              onValueChange={(text) => chooseClass(text)}
              style={{ height: 50 }}
            >
              {appState.class_names.map((name) => (
                <Picker.Item key={name} label={name} value={name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Term */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-sm font-semibold text-gray-500 mb-2">TERM</Text>
          <View className="border border-gray-300 rounded-xl overflow-hidden">
            <Picker
              selectedValue={appState.selectedTerm}
              onValueChange={(text) => handleTermChange(text)}
              style={{ height: 50 }}
            >
              {appState.term_names.map((term) => (
                <Picker.Item key={term} label={term} value={term} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Total Attendance */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-sm font-semibold text-gray-500 mb-2">
            TOTAL ATTENDANCE
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base text-center font-semibold"
            keyboardType="numeric"
            value={String(appState.totalAttendance || 0)}
            onChangeText={(text) => totalAttendance(Number(text))}
            maxLength={3}
            placeholder="0"
          />
        </View>

        {/* Reset Section */}
        <View className="bg-white rounded-2xl p-5 mb-8">
          <Text className="text-sm font-semibold text-gray-500 mb-2">
            DANGER ZONE
          </Text>
          <Text className="text-gray-600 text-sm mb-4">
            Clear all scores and attendance for every student. Student names and
            behaviour will remain.
          </Text>

          <TouchableOpacity
            className="bg-red-500 py-3.5 rounded-xl items-center"
            onPress={() => setResetModalVisible(true)}
          >
            <Text className="text-white font-semibold">
              Reset All Student Fields
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-2">
              Reset All Data?
            </Text>
            <Text className="text-gray-600 mb-6">
              This will clear all scores and attendance for every student.
              Student names and behaviour will remain.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
                onPress={() => setResetModalVisible(false)}
              >
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-xl items-center"
                onPress={handleResetAll}
              >
                <Text className="font-semibold text-white">Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
