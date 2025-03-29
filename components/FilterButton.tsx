import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";

export const FilterButton = () => {
  return (
    <TouchableOpacity
      onPressOut={() => {
        router.navigate("/(app)/filter");
      }}
    >
      <Ionicons name="options" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
};
