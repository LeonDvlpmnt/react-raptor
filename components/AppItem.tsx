import { Link } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { ReactRaptorApp } from "@/hooks/useReactRaptorAppList";

type Props = {
  item: ReactRaptorApp;
  showNewArchitectureTag?: boolean;
};

export const AppItem = (props: Props) => {
  const {
    item: { appName, packageName, icon, nativeLibraries, expoConfig },
    showNewArchitectureTag = false,
  } = props;

  const probablyNewArchitecture = nativeLibraries.includes("libappmodules.so");
  const probablyExpo = nativeLibraries.includes("libexpo-modules-core.so");
  const usesExpoUpdates = expoConfig?.updates?.url !== undefined;

  return (
    <Link href={`/${packageName}`} asChild>
      <Pressable>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                cacheKey: packageName,
                uri: `data:image/png;base64,${icon}`,
              }}
              style={styles.logo}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.appName}>{appName}</Text>
            <Text style={styles.packageName}>{packageName}</Text>
            <View style={styles.tags}>
              {probablyExpo ? (
                <View style={[styles.tag, { backgroundColor: "#000" }]}>
                  <Text style={styles.tagText}>Expo modules</Text>
                </View>
              ) : null}

              {probablyNewArchitecture && showNewArchitectureTag ? (
                <View style={[styles.tag, { backgroundColor: "#28a745" }]}>
                  <Text style={styles.tagText}>New Architecture</Text>
                </View>
              ) : null}

              {usesExpoUpdates ? (
                <View style={[styles.tag, { backgroundColor: "#007bff" }]}>
                  <Text style={styles.tagText}>Expo Updates</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        <View
          style={{ height: 1, backgroundColor: "#ddd", marginHorizontal: 10 }}
        ></View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    marginLeft: 10,
  },
  appName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  packageName: {
    fontSize: 14,
    color: "#666",
  },
  author: {
    fontSize: 12,
    color: "#999",
  },
  tags: {
    flexDirection: "row",
    marginTop: 5,
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
