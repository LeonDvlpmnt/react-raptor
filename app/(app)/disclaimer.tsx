import { theme } from "@/constants/theme";

import { Text, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DisclaimerSheet() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.contentContainerStyle,
        { paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={styles.title}>Disclaimer</Text>

      <Text style={{ color: "#fff" }}>
        The list of apps is non-exhaustive and may not include all React Native
        apps on your device. Apps may use different build systems, which makes
        detection difficult. This list is based on the presence of certain
        native libraries and may not accurately reflect the use of React Native
        in all cases. {`\n\n`}Furthermore, it is important to note that apps may
        use React Native only for certain portions of their codebase. An example
        of this is the Marketplace functionality in the Facebook app.
      </Text>
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
});
