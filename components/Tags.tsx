import { ReactRaptorApp } from "@/hooks/useReactRaptorAppList";
import {
  dotnetSubtypeLabel,
  frameworkDisplayName,
  kmpSubtypeLabel,
} from "@/helpers/detectFramework";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  item: ReactRaptorApp;
  enabledTags?: string[];
};

const FW_COLORS: Record<string, string> = {
  flutter: "#02569B",
  unity: "#222",
  dotnet: "#512BD4",
  nativescript: "#3655ff",
  "kotlin-multiplatform": "#7F52FF",
  "react-native": "#087ea4",
  "cordova-capacitor": "#2196f3",
  native: "#607d8b",
  other: "#9e9e9e",
};

function fwColor(fw: string): string {
  return FW_COLORS[fw] ?? "#666";
}

export const Tags = (props: Props) => {
  const { item, enabledTags } = props;
  const {
    nativeLibraries,
    expoConfig,
    primaryFramework,
    dotnetSubtype,
    kmpSubtype,
  } = item;

  const probablyNewArchitecture = nativeLibraries.includes("libappmodules.so");
  const probablyExpo = nativeLibraries.includes("libexpo-modules-core.so");
  const usesExpoUpdates = expoConfig?.updates?.url !== undefined;

  const tags: { text: string; color: string }[] = [];

  tags.push({
    text: frameworkDisplayName(primaryFramework),
    color: fwColor(primaryFramework),
  });

  if (primaryFramework === "dotnet" && dotnetSubtype) {
    tags.push({
      text: dotnetSubtypeLabel(dotnetSubtype),
      color: "#7c4dff",
    });
  }

  if (primaryFramework === "kotlin-multiplatform" && kmpSubtype) {
    tags.push({
      text: kmpSubtypeLabel(kmpSubtype),
      color: "#7F52FF",
    });
  }

  if (primaryFramework === "react-native") {
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
