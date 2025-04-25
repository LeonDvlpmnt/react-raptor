import { FlatList, StyleSheet } from "react-native";
import { AppItem } from "@/components/AppItem";
import { Link, useNavigation } from "expo-router";
import { LoadingApps } from "@/components/LoadingApps";
import { useSettingsStore } from "@/helpers/settings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NoResults } from "@/components/NoResults";
import { useReactRaptorAppList } from "@/hooks/useReactRaptorAppList";
import { useEffect, useState } from "react";
import { FilterButton } from "@/components/FilterButton";
import { ClearableTextInput } from "@/components/ClearableTextInput";

export default function Index() {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState<string>("");

  const { data, isPending, error } = useReactRaptorAppList();

  useEffect(() => {
    navigation.setOptions({
      title: "React Native Apps",
      headerRight: () => <FilterButton />,
    });
  }, []);

  const insets = useSafeAreaInsets();

  const { enabledTags } = useSettingsStore();

  if (isPending) {
    return <LoadingApps />;
  }

  if (!isPending && (error || !data || data.length === 0)) {
    return <NoResults />;
  }

  return (
    <>
      <ClearableTextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Search..."
      />
      <FlatList
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
        data={data.filter((item) =>
          item.appName.toLowerCase().includes(keyword.toLowerCase())
        )}
        renderItem={({ item }) => (
          <AppItem item={item} enabledTags={enabledTags} />
        )}
        keyExtractor={(item) => item.packageName}
        extraData={enabledTags}
        ListFooterComponent={
          <Link style={styles.link} href="/disclaimer">
            Disclaimer
          </Link>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    paddingVertical: 12,
    color: "#888",
    textAlign: "center",
    textDecorationLine: "underline",
    textDecorationColor: "#888",
  },
});
