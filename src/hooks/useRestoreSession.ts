import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "@/src/context/app/appContext";
import { useStudents } from "@/src/context/student/studentContext";
import Toast from "react-native-toast-message";

export function useRestoreSession() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [initialScreen, setInitialScreen] = useState<"Welcome" | "StudentList">(
    "Welcome",
  );
  const {
    state: appState,
    dispatch: appDispatch,
    chooseClass,
    totalAttendance,
    selectTerm,
  } = useApp();

  const { state: studentState, dispatch: studentDispatch } = useStudents();

  // checking if class data exist to login directly

  // load students if available
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const saved = await AsyncStorage.getItem("activeClass");

        if (!saved) {
          setInitialScreen("Welcome");
          return;
        }

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

          if (reportData.class) {
            chooseClass(reportData.class);
          }

          setInitialScreen("StudentList");

          Toast.show({
            type: "success",
            text1: "Previous data restored",
            text2: `${reportData.students.length} students loaded`,
          });
        } else {
          setInitialScreen("Welcome");
        }
      } catch (error) {
        console.log("Failed to load saved data:", error);
        setInitialScreen("Welcome");
      } finally {
        setCheckingSession(false);
      }
    };

    loadSavedData();
  }, []);
  return { checkingSession, initialScreen };
}
