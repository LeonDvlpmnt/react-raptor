import {
  ScrollView,
  View,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { ReactRaptorApp } from "@/hooks/useReactRaptorAppList";

type Props = {
  app: ReactRaptorApp;
};

export const DetailsTab = (props: Props) => {
  const { app } = props;

  const {
    packageName,
    nativeLibraries,
    icon,
    appName,
    size,
    versionName,
    expoConfig,
    permissions,
    dependencies,
  } = app;

  const playStoreLink = `https://play.google.com/store/apps/details?id=${packageName}`;

  return (
    <ScrollView>
      <View style={styles.imageContainer}>
        <Image
          source={{
            cacheKey: packageName,
            uri: `data:image/png;base64,${icon}`,
          }}
          style={{ width: 100, height: 100 }}
        />
      </View>

      <Text style={styles.appName}>{appName}</Text>

      <View style={styles.card}>
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Package Name</Text>
          <Text style={styles.itemText}>{packageName}</Text>
        </View>

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

        <View style={styles.item}>
          <Text style={styles.itemTitle}>Expo version</Text>
          <Text style={styles.itemText}>{expoConfig?.sdkVersion ?? "N/A"}</Text>
        </View>

        {dependencies ? (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>NPM Dependencies</Text>
            <Text style={styles.itemText}>{JSON.stringify(dependencies, null, 2)}</Text>
          </View>
        ) : null}

        <View style={styles.item}>
          <Text style={styles.itemTitle}>Native Libraries</Text>
          <Text style={styles.itemText}>{nativeLibraries.join(", ")}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemTitle}>Permissions</Text>
          <Text style={styles.itemText}>{permissions.join(", ")}</Text>
        </View>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    paddingTop: 16,
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
  },
  appName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    textAlign: "center",
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    margin: 12,
    gap: 8,
  },
  item: {
    flexDirection: "column",
  },
  itemTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  itemText: {
    fontFamily: "Inter_400Regular",
    color: "#666",
  },
  link: {
    color: "#007bff",
  },
});
