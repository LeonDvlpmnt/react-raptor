import { useQuery } from "@tanstack/react-query";
import {
  AndroidAppListPackage,
  ExpoAndroidAppList,
} from "expo-android-app-list";
import { ExpoConfig } from "@expo/config-types";
import {
  CORDOVA_CAPACITOR_PROBE_PATHS,
  PWA_ASSET_PROBE_PATHS,
  REACT_NATIVE_ASSET_PROBE_PATHS,
  classifyStageOne,
  dotnetAssemblyProbePaths,
  finalizeAfterHybridProbe,
  resolveDotnetSubtypeFromFileHits,
  shouldProbeCordovaCapacitor,
  type DotnetSubtype,
  type FrameworkKind,
  type KmpSubtype,
} from "@/helpers/detectFramework";
import { inferSdkHintsTierA, type SdkHint } from "@/helpers/inferSdkHints";

const ICON_PERM_CONCURRENCY = 12;

async function mapInChunks<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    await Promise.all(slice.map((item, j) => fn(item, i + j)));
  }
}

export type ReactRaptorApp = AndroidAppListPackage & {
  icon: string;
  nativeLibraries: string[];
  expoConfig?: ExpoConfig;
  permissions: string[];
  primaryFramework: FrameworkKind;
  dotnetSubtype?: DotnetSubtype;
  kmpSubtype?: KmpSubtype;
  frameworkSignals: string[];
  sdkHints: SdkHint[];
};

type MutableRow = Omit<
  ReactRaptorApp,
  "icon" | "permissions" | "expoConfig"
> & {
  icon: string;
  permissions: string[];
  expoConfig?: ExpoConfig;
};

export const reactRaptorAppListQueryFn = async (): Promise<
  ReactRaptorApp[]
> => {
  const all = await ExpoAndroidAppList.getAll();
  const nonSystem = all.filter((p) => !p.isSystemApp);

  const mutableRows: MutableRow[] = [];

  for (const pkg of nonSystem) {
    const nativeLibraries = await ExpoAndroidAppList.getNativeLibraries(
      pkg.packageName,
    );

    const stage = classifyStageOne(pkg.packageName, nativeLibraries);
    let primaryFramework: FrameworkKind;
    let dotnetSubtype: DotnetSubtype | undefined;
    let kmpSubtype: KmpSubtype | undefined;
    const frameworkSignals = [...stage.frameworkSignals];

    if (stage.kind === "resolved") {
      primaryFramework = stage.primaryFramework;
      kmpSubtype = stage.kmpSubtype;
    } else if (stage.kind === "dotnet") {
      primaryFramework = "dotnet";
      const probePaths = dotnetAssemblyProbePaths();
      const hits = await ExpoAndroidAppList.hasZipEntries(
        pkg.packageName,
        probePaths,
        false,
      );
      const map: Record<string, boolean> = {};
      probePaths.forEach((p, i) => {
        map[p] = Boolean(hits[i]);
      });
      dotnetSubtype = resolveDotnetSubtypeFromFileHits(map);
    } else {
      const rnAssetHits = await ExpoAndroidAppList.hasZipEntries(
        pkg.packageName,
        [...REACT_NATIVE_ASSET_PROBE_PATHS],
        true,
      );
      if (rnAssetHits.some(Boolean)) {
        primaryFramework = "react-native";
        const i = rnAssetHits.findIndex(Boolean);
        const path = [...REACT_NATIVE_ASSET_PROBE_PATHS][i] ?? "rn-asset";
        frameworkSignals.push(`apk:${path}`);
      } else {
        const pwaAssetHits = await ExpoAndroidAppList.hasZipEntries(
          pkg.packageName,
          [...PWA_ASSET_PROBE_PATHS],
          true,
        );
        if (pwaAssetHits.some(Boolean)) {
          primaryFramework = "pwa";
          const j = pwaAssetHits.findIndex(Boolean);
          const pPath = [...PWA_ASSET_PROBE_PATHS][j] ?? "pwa-asset";
          frameworkSignals.push(`apk:${pPath}`);
        } else {
          let hybrid = false;
          if (shouldProbeCordovaCapacitor(nativeLibraries)) {
            const cordovaHits = await ExpoAndroidAppList.hasZipEntries(
              pkg.packageName,
              [...CORDOVA_CAPACITOR_PROBE_PATHS],
              true,
            );
            hybrid = cordovaHits.some(Boolean);
          }
          const fin = finalizeAfterHybridProbe(nativeLibraries, hybrid);
          primaryFramework = fin.primaryFramework;
          frameworkSignals.push(...fin.frameworkSignals);
        }
      }
    }

    const sdkHints = inferSdkHintsTierA(nativeLibraries);

    mutableRows.push({
      ...pkg,
      nativeLibraries,
      primaryFramework,
      dotnetSubtype,
      kmpSubtype,
      frameworkSignals: [...new Set(frameworkSignals)].slice(0, 24),
      sdkHints,
      icon: "",
      permissions: [],
    });
  }

  await mapInChunks(mutableRows, ICON_PERM_CONCURRENCY, async (row) => {
    const [iconRes, permRes] = await Promise.allSettled([
      ExpoAndroidAppList.getAppIcon(row.packageName),
      ExpoAndroidAppList.getPermissions(row.packageName),
    ]);
    row.icon =
      iconRes.status === "fulfilled" && iconRes.value
        ? String(iconRes.value)
        : "";
    row.permissions =
      permRes.status === "fulfilled" && Array.isArray(permRes.value)
        ? permRes.value
        : [];
  });

  await mapInChunks(
    mutableRows.filter((r) => r.primaryFramework === "react-native"),
    ICON_PERM_CONCURRENCY,
    async (row) => {
      const filesResult = await ExpoAndroidAppList.getFiles(row.packageName, [
        "assets/app.config",
      ]);
      const content = filesResult?.[0]?.content;
      if (content) {
        try {
          row.expoConfig = JSON.parse(content) as ExpoConfig;
        } catch {
          row.expoConfig = undefined;
        }
      }
    },
  );

  return mutableRows.sort((a, b) =>
    a.appName.toLowerCase().localeCompare(b.appName.toLowerCase()),
  );
};

export const useReactRaptorAppList = () => {
  const query = useQuery({
    queryKey: ["packages"],
    // Classification logic changes often during development; avoid long-lived stale scans.
    staleTime: 1000 * 30,
    queryFn: reactRaptorAppListQueryFn,
  });

  return query;
};
