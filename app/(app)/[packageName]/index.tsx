import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useWindowDimensions } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { useReactRaptorApp } from "@/hooks/useReactRaptorApp";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { theme } from "@/constants/theme";
import { DetailsTab } from "@/components/tabs/DetailsTab";
import { ExpoConfigTab } from "@/components/tabs/ExpoConfigTab";

export default function Details() {
  const { packageName } = useLocalSearchParams<{ packageName: string }>();
  const { data } = useReactRaptorApp(packageName);
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);

  const [routes] = React.useState([
    { key: "details", title: "Details" },
    { key: "expoConfig", title: "Expo Config" },
  ]);

  const renderScene = SceneMap({
    details: () => (data ? <DetailsTab app={data} /> : null),
    expoConfig: () => (data ? <ExpoConfigTab app={data} /> : null),
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.primaryLightColor }}
      style={{ backgroundColor: theme.primaryDarkColor }}
      activeColor={theme.primaryLightColor}
      inactiveColor="#666"
      scrollEnabled={false}
    />
  );

  return (
    <>
      <Stack.Screen options={{ headerTitle: data?.appName }} />

      <SystemBars style="light" />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={false}
      />
    </>
  );
}
