import { useQuery } from "@tanstack/react-query";
import {
  AndroidAppListPackage,
  ReactRaptorAppList,
} from "@/modules/ReactRaptorAppListModule";
import { ExpoConfig } from "@expo/config-types";

const reactNativeLibraries = [
  "libreactnativejni.so",
  "libreactnative.so",
  "libjsijniprofiler.so",
];

export type ReactRaptorApp = AndroidAppListPackage & {
  nativeLibraries: string[];
  expoConfig?: ExpoConfig;
  permissions: string[];
};

export const reactRaptorAppListQueryFn = async () => {
  const combinedResults: ReactRaptorApp[] = [];

  const result = await ReactRaptorAppList.getAll();

  for (const pkg of result) {
    if (pkg.isSystemApp) {
      continue;
    }

    const nativeLibraries = await ReactRaptorAppList.getNativeLibraries(
      pkg.packageName,
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
      const [filesResult, permissionsResult] = await Promise.allSettled([
        ReactRaptorAppList.getFiles(pkg.packageName, ["assets/app.config"]),
        ReactRaptorAppList.getPermissions(pkg.packageName),
      ]);

      const files =
        filesResult.status === "fulfilled" ? filesResult.value : undefined;
      const permissions =
        permissionsResult.status === "fulfilled" ? permissionsResult.value : [];

      const config = files?.[0]?.content;
      let expoConfig: ExpoConfig | undefined = undefined;
      if (config) {
        try {
          expoConfig = JSON.parse(config) as ExpoConfig;
        } catch (e) {
          expoConfig = undefined;
        }
      }

      combinedResults.push({
        ...pkg,
        expoConfig,
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
