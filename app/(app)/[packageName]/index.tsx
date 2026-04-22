import React, { useEffect, useState } from "react";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import {
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useReactRaptorApp } from "@/hooks/useReactRaptorApp";
import { theme } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tags } from "@/components/Tags";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import {
  dotnetSubtypeLabel,
  frameworkDisplayName,
  kmpSubtypeLabel,
} from "@/helpers/detectFramework";
import { ExpoAndroidAppList } from "expo-android-app-list";
import {
  inferSdkHintsTierB,
  TIER_B_BACKEND_ZIP_PATHS,
  type SdkHint,
} from "@/helpers/inferSdkHints";
import { useSettingsStore } from "@/helpers/settings";

export default function Details() {
  const { packageName } = useLocalSearchParams<{ packageName: string }>();
  const { data } = useReactRaptorApp(packageName);
  const { deepSdkScan } = useSettingsStore();

  const insets = useSafeAreaInsets();

  const [showNativeLibraries, setShowNativeLibraries] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [mergedSdkHints, setMergedSdkHints] = useState<SdkHint[]>([]);

  useEffect(() => {
    if (!data) return;
    setMergedSdkHints(data.sdkHints);
    if (!deepSdkScan) return;
    let cancelled = false;
    (async () => {
      const pres = await ExpoAndroidAppList.hasZipEntries(
        packageName,
        TIER_B_BACKEND_ZIP_PATHS,
      );
      const zipPresence = Object.fromEntries(
        TIER_B_BACKEND_ZIP_PATHS.map((p, i) => [p, Boolean(pres[i])]),
      );
      let capacitorConfigRaw: string | null = null;
      if (data.primaryFramework === "cordova-capacitor") {
        const fc = await ExpoAndroidAppList.getFiles(packageName, [
          "capacitor.config.json",
          "assets/capacitor.config.json",
        ]);
        capacitorConfigRaw =
          fc.find((f) => f?.content && f.content.length > 0)?.content ?? null;
      }
      const tierB = inferSdkHintsTierB({
        primaryFramework: data.primaryFramework,
        zipPresence,
        expoConfigRaw: data.expoConfig
          ? JSON.stringify(data.expoConfig)
          : undefined,
        capacitorConfigRaw: capacitorConfigRaw ?? undefined,
      });
      const merged = [...data.sdkHints, ...tierB];
      const dedup = new Map<string, SdkHint>();
      merged.forEach((h) => {
        if (!dedup.has(h.id)) dedup.set(h.id, h);
      });
      if (!cancelled) setMergedSdkHints([...dedup.values()]);
    })();
    return () => {
      cancelled = true;
    };
  }, [data, packageName, deepSdkScan]);

  if (!data) {
    return null;
  }

  const {
    nativeLibraries,
    icon,
    size,
    versionName,
    expoConfig,
    permissions,
    primaryFramework,
    dotnetSubtype,
    kmpSubtype,
  } = data;

  const playStoreLink = `https://play.google.com/store/apps/details?id=${packageName}`;

  return (
    <View style={{ flex: 1, backgroundColor: theme.primaryDarkColor }}>
      <Stack.Screen
        options={{ headerTitle: data?.appName, headerTitleAlign: "center" }}
      />

      <ScrollView
        style={{}}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        <View style={styles.imageContainer}>
          <View
            style={{
              boxShadow: "0px 0px 15px 0px rgba(255, 255, 255, 0.1)",
              width: 100,
              height: 100,
              borderRadius: 99,
            }}
          >
            <Image
              source={{
                cacheKey: packageName,
                uri: `data:image/png;base64,${icon}`,
              }}
              style={{
                width: 100,
                height: 100,
              }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.item}>
            <Text style={styles.itemTitle}>Package Name</Text>
            <Text style={styles.itemText}>{packageName}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.item}>
            <Text style={styles.itemTitle}>Primary framework</Text>
            <Text style={styles.itemText}>
              {frameworkDisplayName(primaryFramework)}
              {primaryFramework === "dotnet" && dotnetSubtype
                ? ` — ${dotnetSubtypeLabel(dotnetSubtype)}`
                : ""}
              {primaryFramework === "kotlin-multiplatform" && kmpSubtype
                ? ` — ${kmpSubtypeLabel(kmpSubtype)}`
                : ""}
            </Text>
            {primaryFramework === "kotlin-multiplatform" ? (
              <Text style={[styles.itemText, { marginTop: 6, fontSize: 13 }]}>
                Kotlin Multiplatform is only inferred when Compose Multiplatform
                / Skiko-style native libraries are present. Shared-logic-only
                KMP on Android may appear as Native.
              </Text>
            ) : null}
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            {size ? (
              <View style={styles.item}>
                <Text style={styles.itemTitle}>Size</Text>
                <Text style={styles.itemText}>
                  {(size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            ) : null}

            <View style={styles.item}>
              <Text style={styles.itemTitle}>Version</Text>
              <Text style={styles.itemText}>{versionName}</Text>
            </View>
          </View>

          {primaryFramework === "react-native" ? (
            <>
              <View style={styles.separator} />
              <View style={styles.item}>
                <Text style={styles.itemTitle}>Expo version</Text>
                <Text style={styles.itemText}>
                  {expoConfig?.sdkVersion ?? "N/A"}
                </Text>
              </View>
            </>
          ) : null}

          <View style={styles.separator} />

          <View style={styles.item}>
            <Text style={styles.itemTitle}>Possible SDKs & services</Text>
            <Text style={[styles.itemText, { marginBottom: 8, fontSize: 13 }]}>
              Heuristic signals only — not a security audit. No secrets are
              shown.
            </Text>
            {mergedSdkHints.length === 0 ? (
              <Text style={styles.itemText}>None detected from this scan.</Text>
            ) : (
              mergedSdkHints.map((h) => (
                <Text key={h.id} style={styles.itemText}>
                  • {h.id} ({h.kind}, {h.confidence}, {h.source})
                </Text>
              ))
            )}
          </View>

          <View style={styles.separator} />

          <Tags item={data} />

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowNativeLibraries((prev) => !prev)}
            hitSlop={{
              top: 12,
              bottom: 12,
            }}
          >
            <Text style={styles.itemTitle}>Native Libraries</Text>
            <Ionicons
              name={showNativeLibraries ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </TouchableOpacity>

          {showNativeLibraries && (
            <Text style={styles.itemText}>
              {nativeLibraries.map((nativeLibrary) => `${nativeLibrary}\n`)}
            </Text>
          )}

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowPermissions((prev) => !prev)}
            hitSlop={{
              top: 12,
              bottom: 12,
            }}
          >
            <Text style={styles.itemTitle}>Permissions</Text>
            <Ionicons
              name={showPermissions ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </TouchableOpacity>

          {showPermissions && (
            <ScrollView horizontal={true}>
              <Text style={styles.itemText}>
                {permissions.map((permission) => `${permission}\n`)}
              </Text>
            </ScrollView>
          )}

          <View style={styles.separator} />

          {expoConfig ? (
            <>
              <Link asChild href={`/${packageName}/expo-config`}>
                <TouchableOpacity
                  hitSlop={{
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <View style={styles.row}>
                    <Text style={styles.itemTitle}>Expo Config</Text>
                    <Ionicons name="chevron-forward-outline" size={24} />
                  </View>
                </TouchableOpacity>
              </Link>
              <View style={styles.separator} />
            </>
          ) : null}

          <View style={styles.item}>
            <Text style={styles.itemTitle}>Play Store</Text>
            <TouchableOpacity
              onPress={async () => {
                try {
                  const canOpenURL = await Linking.canOpenURL(playStoreLink);
                  if (!canOpenURL) {
                    throw new Error("Cannot open URL");
                  }
                  await Linking.openURL(playStoreLink);
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              <Text style={[styles.itemText, styles.link]}>
                <Text>{playStoreLink}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Link style={styles.discliamerLink} href="/disclaimer">
          Disclaimer
        </Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    paddingTop: 16,
    alignItems: "center",
    backgroundColor: theme.primaryDarkColor,
    paddingBottom: 24,
  },
  image: {
    width: 100,
    height: 100,
  },
  card: {
    backgroundColor: "#eeeeee",
    padding: 20,
    borderRadius: 24,
    elevation: 4,
    gap: 12,
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    flexDirection: "column",
    flex: 1,
  },
  itemTitle: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
  },
  itemText: {
    fontFamily: "Inter_400Regular",
    color: "#666",
  },
  link: {
    color: "#007bff",
  },
  discliamerLink: {
    paddingVertical: 12,
    color: "#888",
    textAlign: "center",
    textDecorationLine: "underline",
    textDecorationColor: "#888",
  },
});
