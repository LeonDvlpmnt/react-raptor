import { theme } from "@/constants/theme";
import { useSettingsStore } from "@/helpers/settings";

import { Text, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FilterSheet() {
  const insets = useSafeAreaInsets();

  const { showNewArchitectureTag, setShowNewArchitectureFlag } =
    useSettingsStore();

  return (
    <View
      style={[
        styles.contentContainerStyle,
        { paddingBottom: insets.bottom + 16 },
      ]}
    >
      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterTitle}>New Architecture tag</Text>
          <Text style={styles.filterSubText}>
            The New Architecture tag is currently experimental and may not be
            fully accurate.
          </Text>
        </View>

        <Switch
          value={showNewArchitectureTag}
          onValueChange={setShowNewArchitectureFlag}
          thumbColor="#ffffff"
          trackColor={{ false: "#767577", true: "#E6AF2E" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: theme.primaryDarkColor,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    gap: 10,
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
