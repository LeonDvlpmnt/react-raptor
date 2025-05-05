import { Link } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { ReactRaptorApp } from "@/hooks/useReactRaptorAppList";
import { Tags } from "./Tags";

type Props = {
  item: ReactRaptorApp;
  enabledTags?: string[];
};

export const AppItem = (props: Props) => {
  const {
    item: { appName, packageName, icon },
    enabledTags = [],
  } = props;
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

            <View style={{ marginTop: 5 }}>
              <Tags item={props.item} enabledTags={enabledTags} />
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
});
