import { Stack } from "expo-router";

export default function E2ELayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#191716" },
        headerTintColor: "#fff",
        title: "E2E",
      }}
    />
  );
}
