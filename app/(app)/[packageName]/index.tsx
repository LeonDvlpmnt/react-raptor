import React, { useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, View, StyleSheet } from "react-native";
import {
  Column,
  ElevatedCard,
  FlowRow,
  Host,
  HorizontalDivider,
  Icon,
  Row,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clickable,
  fillMaxWidth,
  padding,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useReactRaptorApp } from "@/hooks/useReactRaptorApp";
import { theme } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIconView } from "@/components/AppIconView";

export default function Details() {
  const { packageName } = useLocalSearchParams<{ packageName: string }>();
  const { data } = useReactRaptorApp(packageName);

  const insets = useSafeAreaInsets();

  const [showNativeLibraries, setShowNativeLibraries] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  if (!data) {
    return null;
  }

  const { nativeLibraries, size, versionName, expoConfig, permissions } = data;

  const playStoreLink = `https://play.google.com/store/apps/details?id=${packageName}`;
  const tags = getTags(data);

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
            <AppIconView
              packageName={packageName}
              style={{
                width: 100,
                height: 100,
              }}
            />
          </View>
        </View>

        <Host matchContents={{ vertical: true }} colorScheme="light">
          <ElevatedCard
            colors={{ containerColor: "#eeeeee", contentColor: "#191716" }}
            elevation={4}
            modifiers={[fillMaxWidth()]}
          >
            <Column
              verticalArrangement={{ spacedBy: 12 }}
              modifiers={[fillMaxWidth(), paddingAll(20)]}
            >
              <InfoItem title="Package Name" value={packageName} />

              <HorizontalDivider color="#dddddd" />

              <Row verticalAlignment="top" modifiers={[fillMaxWidth()]}>
                {size ? (
                  <InfoItem
                    title="Size"
                    value={`${(size / 1024 / 1024).toFixed(2)} MB`}
                  />
                ) : null}

                <InfoItem title="Version" value={versionName} />
              </Row>

              <HorizontalDivider color="#dddddd" />

              <InfoItem
                title="Expo version"
                value={expoConfig?.sdkVersion ?? "N/A"}
              />

              {tags.length > 0 ? (
                <>
                  <HorizontalDivider color="#dddddd" />
                  <FlowRow
                    horizontalArrangement={{ spacedBy: 5 }}
                    verticalArrangement={{ spacedBy: 5 }}
                  >
                    {tags.map((tag) => (
                      <Text
                        key={tag.text}
                        color="#ffffff"
                        style={{ typography: "labelSmall" }}
                        modifiers={[background(tag.color), padding(5, 5, 5, 5)]}
                      >
                        {tag.text}
                      </Text>
                    ))}
                  </FlowRow>
                </>
              ) : null}

              <HorizontalDivider color="#dddddd" />

              <DisclosureRow
                title="Native Libraries"
                expanded={showNativeLibraries}
                onPress={() => setShowNativeLibraries((prev) => !prev)}
              />

              {showNativeLibraries ? (
                <Text color="#666666" style={{ typography: "bodyMedium" }}>
                  {nativeLibraries.join("\n")}
                </Text>
              ) : null}

              <HorizontalDivider color="#dddddd" />

              <DisclosureRow
                title="Permissions"
                expanded={showPermissions}
                onPress={() => setShowPermissions((prev) => !prev)}
              />

              {showPermissions ? (
                <Text color="#666666" style={{ typography: "bodyMedium" }}>
                  {permissions.join("\n")}
                </Text>
              ) : null}

              <HorizontalDivider color="#dddddd" />

              {expoConfig ? (
                <>
                  <NavigationRow
                    title="Expo Config"
                    onPress={() =>
                      router.navigate(`/${packageName}/expo-config`)
                    }
                  />
                  <HorizontalDivider color="#dddddd" />
                </>
              ) : null}

              <Column
                verticalArrangement={{ spacedBy: 4 }}
                modifiers={[fillMaxWidth()]}
              >
                <Text
                  color="#191716"
                  style={{ typography: "titleMedium", fontWeight: "700" }}
                >
                  Play Store
                </Text>
                <Text
                  color="#007bff"
                  style={{ typography: "bodyMedium" }}
                  modifiers={[
                    clickable(async () => {
                      try {
                        const canOpenURL =
                          await Linking.canOpenURL(playStoreLink);
                        if (!canOpenURL) {
                          throw new Error("Cannot open URL");
                        }
                        await Linking.openURL(playStoreLink);
                      } catch (error) {
                        console.log(error);
                      }
                    }),
                  ]}
                >
                  {playStoreLink}
                </Text>
              </Column>
            </Column>
          </ElevatedCard>
        </Host>

        <Host matchContents>
          <Text
            color="#888888"
            style={{
              typography: "bodyMedium",
              textAlign: "center",
              textDecoration: "underline",
            }}
            modifiers={[
              fillMaxWidth(),
              padding(0, 12, 0, 12),
              clickable(() => router.navigate("/disclaimer")),
            ]}
          >
            Disclaimer
          </Text>
        </Host>
      </ScrollView>
    </View>
  );
}

type InfoItemProps = {
  title: string;
  value?: string;
};

function InfoItem({ title, value }: InfoItemProps) {
  return (
    <Column verticalArrangement={{ spacedBy: 4 }} modifiers={[weight(1)]}>
      <Text
        color="#191716"
        style={{ typography: "titleMedium", fontWeight: "700" }}
      >
        {title}
      </Text>
      <Text color="#666666" style={{ typography: "bodyMedium" }}>
        {value ?? "N/A"}
      </Text>
    </Column>
  );
}

type DisclosureRowProps = {
  title: string;
  expanded: boolean;
  onPress: () => void;
};

function DisclosureRow({ title, expanded, onPress }: DisclosureRowProps) {
  return (
    <Row
      verticalAlignment="center"
      modifiers={[fillMaxWidth(), clickable(onPress), padding(0, 4, 0, 4)]}
    >
      <Text
        color="#191716"
        style={{ typography: "titleMedium", fontWeight: "700" }}
        modifiers={[weight(1)]}
      >
        {title}
      </Text>
      <Icon
        source={
          expanded
            ? require("@/assets/icons/chevron_up.xml")
            : require("@/assets/icons/chevron_down.xml")
        }
        size={24}
        tint="#191716"
        contentDescription={expanded ? "Collapse" : "Expand"}
      />
    </Row>
  );
}

type NavigationRowProps = {
  title: string;
  onPress: () => void;
};

function NavigationRow({ title, onPress }: NavigationRowProps) {
  return (
    <Row
      verticalAlignment="center"
      modifiers={[fillMaxWidth(), clickable(onPress), padding(0, 4, 0, 4)]}
    >
      <Text
        color="#191716"
        style={{ typography: "titleMedium", fontWeight: "700" }}
        modifiers={[weight(1)]}
      >
        {title}
      </Text>
      <Icon
        source={require("@/assets/icons/chevron_right.xml")}
        size={24}
        tint="#191716"
        contentDescription="Open"
      />
    </Row>
  );
}

function getTags(
  item: NonNullable<ReturnType<typeof useReactRaptorApp>["data"]>,
) {
  const probablyNewArchitecture =
    item.nativeLibraries.includes("libappmodules.so");
  const probablyExpo = item.nativeLibraries.includes("libexpo-modules-core.so");
  const usesExpoUpdates = item.expoConfig?.updates?.url !== undefined;

  const tags: { text: string; color: string }[] = [
    { text: "React Native", color: "#087ea4" },
  ];

  if (probablyNewArchitecture) {
    tags.push({ text: "New Architecture", color: "#28a745" });
  }

  if (probablyExpo) {
    tags.push({ text: "Expo modules", color: "#000000" });
  }

  if (usesExpoUpdates) {
    tags.push({ text: "Expo Updates", color: "#007bff" });
  }

  return tags;
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
});
