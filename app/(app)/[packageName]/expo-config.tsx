import React, { useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useReactRaptorApp } from "@/hooks/useReactRaptorApp";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, ScrollView } from "react-native";

export default function ExpoConfig() {
  const { packageName } = useLocalSearchParams<{ packageName: string }>();
  const { data } = useReactRaptorApp(packageName);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: "Expo Config",
    });
  }, [navigation]);

  const insets = useSafeAreaInsets();

  if (!data?.expoConfig) {
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
          {JSON.stringify(data.expoConfig, null, 2)}
        </Text>
      </ScrollView>
    </ScrollView>
  );
}
