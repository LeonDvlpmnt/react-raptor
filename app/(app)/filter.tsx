import { theme } from "@/constants/theme";
import { useSettingsStore } from "@/helpers/settings";
import { Host, Column, Row, Switch, Text } from "@expo/ui/jetpack-compose";
import {
  background,
  fillMaxWidth,
  padding,
  paddingAll,
  toggleable,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const filters = [
  { label: "React Native", tag: "react-native" },
  { label: "Expo Modules", tag: "expo-modules" },
  { label: "Expo Updates", tag: "expo-updates" },
  { label: "New Architecture", tag: "new-architecture" },
] as const;

export default function FilterSheet() {
  const insets = useSafeAreaInsets();

  const { enabledTags, toggleTag } = useSettingsStore();

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
          Tags
        </Text>

        {filters.map((filter) => {
          const checked = enabledTags.includes(filter.tag);

          return (
            <Row
              key={filter.tag}
              verticalAlignment="center"
              horizontalArrangement="spaceBetween"
              modifiers={[
                fillMaxWidth(),
                paddingAll(4),
                toggleable(checked, () => toggleTag(filter.tag), {
                  role: "switch",
                }),
              ]}
            >
              <Text
                color="#ffffff"
                style={{ typography: "titleMedium", fontWeight: "700" }}
                modifiers={[weight(1)]}
              >
                {filter.label}
              </Text>
              <Switch
                value={checked}
                colors={{
                  checkedThumbColor: "#ffffff",
                  checkedTrackColor: "#E6AF2E",
                  uncheckedThumbColor: "#ffffff",
                  uncheckedTrackColor: "#767577",
                }}
              />
            </Row>
          );
        })}
      </Column>
    </Host>
  );
}
