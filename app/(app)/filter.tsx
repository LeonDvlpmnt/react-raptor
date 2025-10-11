import { theme } from "@/constants/theme";
import { useSettingsStore } from "@/helpers/settings";

import { Text, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FilterSheet() {
  const insets = useSafeAreaInsets();

  const { enabledTags, toggleTag } = useSettingsStore();

  return (
    <View
      style={[
        styles.contentContainerStyle,
        { paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={styles.title}>Tags</Text>

      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterTitle}>React Native</Text>
        </View>

        <Switch
          value={enabledTags.includes("react-native")}
          onValueChange={() => {
            toggleTag("react-native");
          }}
          thumbColor="#ffffff"
          trackColor={{ false: "#767577", true: "#E6AF2E" }}
        />
      </View>

      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterTitle}>Expo Modules</Text>
        </View>

        <Switch
          value={enabledTags.includes("expo-modules")}
          onValueChange={() => {
            toggleTag("expo-modules");
          }}
          thumbColor="#ffffff"
          trackColor={{ false: "#767577", true: "#E6AF2E" }}
        />
      </View>

      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterTitle}>Expo Updates</Text>
        </View>

        <Switch
          value={enabledTags.includes("expo-updates")}
          onValueChange={() => {
            toggleTag("expo-updates");
          }}
          thumbColor="#ffffff"
          trackColor={{ false: "#767577", true: "#E6AF2E" }}
        />
      </View>

      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterTitle}>New Architecture</Text>
        </View>

        <Switch
          value={enabledTags.includes("new-architecture")}
          onValueChange={() => {
            toggleTag("new-architecture");
          }}
          thumbColor="#ffffff"
          trackColor={{ false: "#767577", true: "#E6AF2E" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: theme.primaryDarkColor,
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Inter_400Regular",
  },
  filterSubText: {
    fontSize: 14,
    color: "#cccccc",
    fontFamily: "Inter_400Regular",
  },
});
