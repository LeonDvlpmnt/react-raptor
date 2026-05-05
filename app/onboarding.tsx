import { Button, Host, Text } from "@expo/ui/jetpack-compose";
import { router, Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSettingsStore } from "@/helpers/settings";

export default function Onboarding() {
  const { setHasFinishedOnboarding } = useSettingsStore();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={require("@/assets/images/react-raptor.svg")}
        style={styles.logo}
        contentFit="contain"
      />

      <Host
        matchContents={{ vertical: true }}
        style={{ width: "80%" }}
        colorScheme="dark"
        seedColor="#E6AF2E"
      >
        <Text
          color="#ffffff"
          style={{ typography: "titleMedium", textAlign: "center" }}
        >
          Welcome to ReactRaptor! Discover which apps on your device are built
          with React Native.
        </Text>
      </Host>

      <Host matchContents>
        <Button
          colors={{
            containerColor: "#ffffff",
            contentColor: "#191716",
          }}
          onClick={() => {
            setHasFinishedOnboarding(true);

            router.replace("/");
          }}
        >
          <Text>Get Started</Text>
        </Button>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191716",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 50,
  },
  logo: {
    width: 175,
    height: 175,
  },
});
