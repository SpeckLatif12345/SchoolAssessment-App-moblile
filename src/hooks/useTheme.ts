import { useColorScheme } from "react-native";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    colorScheme,
    isDark,

    colors: {
      background: isDark ? "#111827" : "#F3F4F6",
      surface: isDark ? "#1F2937" : "#FFFFFF",

      text: isDark ? "#FFFFFF" : "#111827",
      textSecondary: isDark ? "#D1D5DB" : "#4B5563",
      textMuted: isDark ? "#9CA3AF" : "#6B7280",

      border: isDark ? "#4B5563" : "#D1D5DB",

      inputBackground: isDark ? "#1F2937" : "#FFFFFF",
      inputText: isDark ? "#FFFFFF" : "#111827",
      placeholder: isDark ? "#9CA3AF" : "#6B7280",
    },
  };
}
