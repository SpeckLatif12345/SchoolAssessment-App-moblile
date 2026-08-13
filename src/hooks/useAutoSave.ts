import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AutoSaveData = {
  className: string;
  students: any[];
  term: string;
  totalAttendance: number;
};

export function useAutoSave({
  className,
  students,
  term,
  totalAttendance,
}: AutoSaveData) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    // Don't auto-save on the very first render
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (!className || students.length === 0) return;

    // Clear previous timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Save after 1.5 seconds of no changes (debounce)
    timeoutRef.current = setTimeout(async () => {
      try {
        const reportData = {
          school: "Chrispal International School",
          class: className,
          students,
          term,
          totalAttendance,
          savedAt: new Date().toISOString(),
        };

        // await AsyncStorage.setItem(className, JSON.stringify(reportData));
        await AsyncStorage.setItem("activeClass", JSON.stringify(reportData));

        // Format time like: 07:52 AM
        const now = new Date();
        const formatted = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        setLastSaved(formatted);
        console.log("Auto-saved at", formatted);

        console.log("Auto-saved:", className);
      } catch (error) {
        console.log("Auto-save failed:", error);
      }
    }, 1500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [students, totalAttendance, className]);

  return { lastSaved };
}
