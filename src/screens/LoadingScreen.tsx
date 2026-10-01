import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function LoadingScreen() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // infinite
      true, // reverse (grow → shrink → grow...)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2563eb" />

      <View className="flex-row items-center mt-4">
        <Text className="text-gray-600 text-base">Teacher</Text>

        <Animated.View style={[{ marginLeft: 6 }, animatedStyle]}>
          <Text style={{ fontSize: 22 }}>👋</Text>
        </Animated.View>
      </View>

      <Text className="mt-2 text-gray-400 text-sm">Loading...</Text>
    </View>
  );
}
