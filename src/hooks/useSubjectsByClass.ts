import { useMemo, useEffect } from "react";
import { useApp } from "@/src/context/app/appContext";
import { useStudents } from "@/src/context/student/studentContext";

function getSubjectLevel(className: string) {
  const name = className.toUpperCase();
  if (name.startsWith("CLASS")) return "Class";
  if (name.startsWith("JSS") || name.startsWith("JHS")) return "JHS";
  return "Class";
}

export function useSubjectsByClass() {
  const { state: appState } = useApp();
  const { state: studentState, dispatch } = useStudents();

  const selectedClass = appState.selectedClass || "";
  const currentSubject = studentState.currentSubject;
  const subjects = studentState.subjects;

  // get subject level
  const subjectLevel = useMemo(
    () => getSubjectLevel(selectedClass),
    [selectedClass],
  );

  // subjects
  const availableSubjects = useMemo(
    () => [...subjects[subjectLevel]],
    [studentState.subjects, appState.selectedClass],
  );

  // If current subject is not in the list, switch to the first one
  useEffect(() => {
    if (!availableSubjects.includes(currentSubject)) {
      dispatch({
        type: "SET_SUBJECT",
        payload: availableSubjects[0],
      });
    }
  }, [selectedClass, availableSubjects, currentSubject, dispatch]);

  return {
    subjectLevel, // "Class" | "JHS"
    availableSubjects, // string[]
    currentSubject,
    totalSubjects: availableSubjects.length,
  };
}
