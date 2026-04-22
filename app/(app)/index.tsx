import { FlatList, StyleSheet } from "react-native";
import { AppItem } from "@/components/AppItem";
import { Link, useNavigation } from "expo-router";
import { LoadingApps } from "@/components/LoadingApps";
import { useSettingsStore } from "@/helpers/settings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NoResults } from "@/components/NoResults";
import { useReactRaptorAppList } from "@/hooks/useReactRaptorAppList";
import { useEffect, useState, useMemo } from "react";
import { FilterButton } from "@/components/FilterButton";
import { ClearableTextInput } from "@/components/ClearableTextInput";
import { passesFrameworkFilter } from "@/helpers/frameworkFilter";

export default function Index() {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState<string>("");

  const { data, isPending, error } = useReactRaptorAppList();

  useEffect(() => {
    navigation.setOptions({
      title: "Installed apps",
      headerRight: () => <FilterButton />,
    });
  }, [navigation]);

  const insets = useSafeAreaInsets();

  const { enabledTags, frameworkFilters } = useSettingsStore();

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (item) =>
        item.appName.toLowerCase().includes(keyword.toLowerCase()) &&
        passesFrameworkFilter(item, frameworkFilters),
    );
  }, [data, keyword, frameworkFilters]);

  if (isPending) {
    return <LoadingApps />;
  }

  if (!isPending && (error || !data)) {
    return (
      <NoResults
        errorMessage={
          error ? (error as Error).message : "No data returned from scan."
        }
      />
    );
  }

  if (data && data.length > 0 && filteredData.length === 0) {
    return (
      <>
        <ClearableTextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Search..."
        />
        <NoResults filterEmpty />
      </>
    );
  }

  if (!isPending && data && data.length === 0) {
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
        data={filteredData}
        renderItem={({ item }) => (
          <AppItem item={item} enabledTags={enabledTags} />
        )}
        keyExtractor={(item) => item.packageName}
        extraData={[enabledTags, frameworkFilters]}
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
