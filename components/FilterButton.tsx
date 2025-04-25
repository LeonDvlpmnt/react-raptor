import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable } from "react-native";

export const FilterButton = () => {
  return (
    <Pressable
      style={{
        width: 24,
        height: 24,
      }}
      onPressOut={() => {
        router.navigate("/(app)/filter");
      }}
    >
      <Ionicons name="options" size={24} color="#ffffff" />
    </Pressable>
  );
};
