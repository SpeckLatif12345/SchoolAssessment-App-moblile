import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useApp } from "@/src/context/app/appContext";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    state: appState,
    chooseClass,
    totalAttendance,
    dispatch: appDispatch,
  } = useApp();

  function handleTermChange(value: string) {
    appDispatch({
      type: "SET_TERM",
      payload: value,
    });
  }

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
          <Text className="text-xs text-gray-400 mt-2 text-center">
            Maximum number of school days in this term
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
