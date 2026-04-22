import { theme } from "@/constants/theme";
import { FRAMEWORK_FILTER_OPTIONS } from "@/helpers/frameworkFilter";
import { useSettingsStore } from "@/helpers/settings";

import {
  Text,
  StyleSheet,
  Switch,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FilterSheet() {
  const insets = useSafeAreaInsets();

  const {
    enabledTags,
    toggleTag,
    frameworkFilters,
    toggleFrameworkFilter,
    setFrameworkFiltersPresetReactNativeOnly,
    setFrameworkFiltersShowAll,
    deepSdkScan,
    setDeepSdkScan,
  } = useSettingsStore();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.contentContainerStyle,
        { paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={styles.title}>Frameworks</Text>

      <View style={styles.presetRow}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={setFrameworkFiltersPresetReactNativeOnly}
        >
          <Text style={styles.presetButtonText}>React Native only</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={setFrameworkFiltersShowAll}
        >
          <Text style={styles.presetButtonText}>Show all</Text>
        </TouchableOpacity>
      </View>

      {FRAMEWORK_FILTER_OPTIONS.map(({ key, label }) => (
        <View key={key} style={styles.filterRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.filterTitle}>{label}</Text>
          </View>

          <Switch
            value={frameworkFilters[key] !== false}
            onValueChange={() => {
              toggleFrameworkFilter(key);
            }}
            thumbColor="#ffffff"
            trackColor={{ false: "#767577", true: "#E6AF2E" }}
          />
        </View>
      ))}

      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterTitle}>Deep SDK scan (detail)</Text>
          <Text style={styles.filterSubText}>
            Extra zip probes on the package screen only. Heuristic, not a
            security audit.
          </Text>
        </View>

        <Switch
          value={deepSdkScan}
          onValueChange={setDeepSdkScan}
          thumbColor="#ffffff"
          trackColor={{ false: "#767577", true: "#E6AF2E" }}
        />
      </View>

      <Text style={[styles.title, { marginTop: 20 }]}>React Native tags</Text>

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
    </ScrollView>
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
  presetRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  presetButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  presetButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
