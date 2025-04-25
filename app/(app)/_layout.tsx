import { useSettingsStore } from "@/helpers/settings";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function TabLayout() {
  const { hasFinishedOnboarding } = useSettingsStore();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  if (!hasFinishedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#191716",
        },
        headerTintColor: "#fff",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="filter"
        options={{
          presentation: "formSheet",
          headerShown: false,
          sheetAllowedDetents: "fitToContents",
          sheetCornerRadius: 16,
          sheetElevation: 4,
        }}
      />

      <Stack.Screen
        name="disclaimer"
        options={{
          presentation: "formSheet",
          headerShown: false,
          sheetAllowedDetents: "fitToContents",
          sheetCornerRadius: 16,
          sheetElevation: 4,
        }}
      />
    </Stack>
  );
}
