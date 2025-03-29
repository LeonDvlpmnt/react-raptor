import { router, Stack } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

      <Text style={styles.text}>
        Welcome to ReactRaptor! Discover which of your apps are built with React
        Native.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setHasFinishedOnboarding(true);

          router.replace("/");
        }}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
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
  text: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    width: "80%",
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  buttonText: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: "#191716",
  },
});
