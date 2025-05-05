import { useQuery } from "@tanstack/react-query";
import {
  AndroidAppListPackage,
  ExpoAndroidAppList,
} from "expo-android-app-list";
import { ExpoConfig } from "@expo/config-types";

const reactNativeLibraries = [
  "libreactnativejni.so",
  "libreactnative.so",
  "libjsijniprofiler.so",
];

export type ReactRaptorApp = AndroidAppListPackage & {
  icon: string;
  nativeLibraries: string[];
  expoConfig?: ExpoConfig;
  permissions: string[];
};

export const reactRaptorAppListQueryFn = async () => {
  const combinedResults: ReactRaptorApp[] = [];

  const result = await ExpoAndroidAppList.getAll();

  for (const pkg of result) {
    if (pkg.isSystemApp) {
      continue;
    }

    const nativeLibraries = await ExpoAndroidAppList.getNativeLibraries(
      pkg.packageName
    );

    // The facebook and instagram apps have a react_native_routes.json file in it's assets folder
    // This indincates that they are using React Native but are using a custom build
    // This bypasses the detection method I can use for every other app
    // That's why I manually add them here and consider them as React Native apps
    // Checking every app for a react_native_routes.json file is not very efficient
    const manuallVerifiedApps = [
      "com.facebook.katana",
      "com.instagram.android",
    ];

    if (
      nativeLibraries.some((lib) => reactNativeLibraries.includes(lib)) ||
      manuallVerifiedApps.includes(pkg.packageName)
    ) {
      const [filesResult, iconResult, permissionsResult] =
        await Promise.allSettled([
          ExpoAndroidAppList.getFiles(pkg.packageName, ["assets/app.config"]),
          ExpoAndroidAppList.getAppIcon(pkg.packageName),
          ExpoAndroidAppList.getPermissions(pkg.packageName),
        ]);

      const files =
        filesResult.status === "fulfilled" ? filesResult.value : undefined;
      const icon = iconResult.status === "fulfilled" ? iconResult.value : "";
      const permissions =
        permissionsResult.status === "fulfilled" ? permissionsResult.value : [];

      const config = files?.[0]?.content;

      combinedResults.push({
        ...pkg,
        icon,
        expoConfig: config ? (JSON.parse(config) as ExpoConfig) : undefined,
        nativeLibraries,
        permissions,
      });
    }
  }

  return combinedResults.sort((a, b) => {
    const aName = a.appName.toLowerCase();
    const bName = b.appName.toLowerCase();
    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  });
};

export const useReactRaptorAppList = () => {
  const query = useQuery({
    queryKey: ["packages"],
    staleTime: 1000 * 60 * 5,
    queryFn: reactRaptorAppListQueryFn,
  });

  return query;
};
