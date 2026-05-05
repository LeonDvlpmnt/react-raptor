import { theme } from "@/constants/theme";

import { Column, Host, Text } from "@expo/ui/jetpack-compose";
import {
  background,
  fillMaxWidth,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DisclaimerSheet() {
  const insets = useSafeAreaInsets();

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: "100%" }}
      colorScheme="dark"
      seedColor="#E6AF2E"
    >
      <Column
        verticalArrangement={{ spacedBy: 12 }}
        modifiers={[
          fillMaxWidth(),
          background(theme.primaryDarkColor),
          padding(20, 16, 20, insets.bottom + 16),
        ]}
      >
        <Text
          color="#ffffff"
          style={{
            typography: "titleMedium",
            fontWeight: "700",
            textAlign: "center",
          }}
          modifiers={[fillMaxWidth()]}
        >
          Disclaimer
        </Text>

        <Text color="#ffffff" style={{ typography: "bodyMedium" }}>
          The list of apps is non-exhaustive and may not include all React
          Native apps on your device. Apps may use different build systems,
          which makes detection difficult. This list is based on the presence of
          certain native libraries and may not accurately reflect the use of
          React Native in all cases.{"\n\n"}Furthermore, it is important to note
          that apps may use React Native only for certain portions of their
          codebase. An example of this is the Marketplace functionality in the
          Facebook app.
        </Text>
      </Column>
    </Host>
  );
}
