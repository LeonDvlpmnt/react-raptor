import { ReactRaptorApp } from "@/hooks/useReactRaptorAppList";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  item: ReactRaptorApp;
  enabledTags?: string[];
};

export const Tags = (props: Props) => {
  const {
    item: { nativeLibraries, expoConfig },
    enabledTags,
  } = props;

  const probablyNewArchitecture = nativeLibraries.includes("libappmodules.so");
  const probablyExpo = nativeLibraries.includes("libexpo-modules-core.so");
  const usesExpoUpdates = expoConfig?.updates?.url !== undefined;

  const tags: Array<{
    text: string;
    color: string;
  }> = [];

  if (enabledTags === undefined || enabledTags.includes("react-native")) {
    tags.push({
      text: "React Native",
      color: "#087ea4",
    });
  }

  if (
    probablyNewArchitecture &&
    (enabledTags === undefined || enabledTags.includes("new-architecture"))
  ) {
    tags.push({
      text: "New Architecture",
      color: "#28a745",
    });
  }

  if (
    probablyExpo &&
    (enabledTags === undefined || enabledTags.includes("expo-modules"))
  ) {
    tags.push({
      text: "Expo modules",
      color: "#000",
    });
  }

  if (
    usesExpoUpdates &&
    (enabledTags === undefined || enabledTags.includes("expo-updates"))
  ) {
    tags.push({
      text: "Expo Updates",
      color: "#007bff",
    });
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <View style={styles.tags}>
      {tags.map((tag, index) => (
        <View key={index} style={[styles.tag, { backgroundColor: tag.color }]}>
          <Text style={styles.tagText}>{tag.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  tag: {
    padding: 5,
    borderRadius: 8,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
  },
});
