import { ReactRaptorApp } from "@/hooks/useReactRaptorAppList";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  app: ReactRaptorApp;
};

export const ExpoConfigTab = (props: Props) => {
  const { app } = props;

  const insets = useSafeAreaInsets();

  if (!app.expoConfig) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No Expo config found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <ScrollView
        horizontal={true}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 8,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <Text style={{ fontFamily: "monospace" }}>
          {JSON.stringify(app.expoConfig, null, 2)}
        </Text>
      </ScrollView>
    </ScrollView>
  );
};
