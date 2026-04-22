/** Ordered native-library + asset classification (see product plan). */

export type FrameworkKind =
  | "flutter"
  | "unity"
  | "dotnet"
  | "nativescript"
  | "kotlin-multiplatform"
  | "react-native"
  | "cordova-capacitor"
  | "pwa"
  | "native"
  | "other";

export type DotnetSubtype = "maui" | "xamarin" | "other";

export type KmpSubtype = "compose-multiplatform";

export const REACT_NATIVE_LIBRARIES = [
  "libreactnativejni.so",
  "libreactnative.so",
  "libjsijniprofiler.so",
  "librninstance.so",
  "libjscexecutor.so",
] as const;

/**
 * APK paths that strongly indicate React Native / Expo when stage-one JNI
 * heuristics miss (e.g. unextracted libs, ABI splits, odd .so naming).
 * `assets/app.config` is the embedded Expo config on managed / prebuild apps.
 */
export const REACT_NATIVE_ASSET_PROBE_PATHS = [
  "assets/index.android.bundle",
  "assets/app.config",
] as const;

export const MANUAL_REACT_NATIVE_PACKAGES = new Set([
  "com.facebook.katana",
  "com.instagram.android",
]);

const DOTNET_NATIVE_LIBS = new Set([
  "libmonosgen-2.0.so",
  "libmono-native.so",
  "libxamarin-app.so",
  "libmono-btls-shared.so",
  "libmonodroid.so",
  "libSystem.Native.so",
]);

const MAUI_ASSEMBLY_PATHS = [
  "assemblies/Microsoft.Maui.Controls.dll",
  "assemblies/Microsoft.Maui.dll",
];

const XAMARIN_ASSEMBLY_PATHS = [
  "assemblies/Xamarin.Forms.Core.dll",
  "assemblies/Xamarin.Forms.Xaml.dll",
  "assemblies/Xamarin.Android.Arch.Core.Common.dll",
];

export const CORDOVA_CAPACITOR_PROBE_PATHS = [
  "assets/www/cordova.js",
  "www/cordova.js",
  "capacitor.config.json",
  "assets/capacitor.config.json",
];

/**
 * Trusted Web Activity / Bubblewrap-style shells (non–WebAPK package ids).
 * Matched with exact zip paths only (see hasZipEntries exactMatch).
 */
export const PWA_ASSET_PROBE_PATHS = [
  "res/raw/twa-manifest.json",
  "res/raw/twa_manifest.json",
  "assets/twa-manifest.json",
  "assets/twa_manifest.json",
] as const;

const LARGE_NATIVE_LIB_COUNT_SKIP_HYBRID = 120;

/**
 * Chrome (and Chromium builds that use Chrome’s WebAPK pipeline) assign each
 * **installed PWA** a synthetic Android package `org.chromium.webapk.<token>`.
 * This is **not** the Chrome browser (`com.android.chrome`, etc.) and not other
 * Chromium-based browsers unless they reuse the same WebAPK mechanism.
 */
export function isChromeWebApkPackageId(packageName: string): boolean {
  return packageName.toLowerCase().startsWith("org.chromium.webapk");
}

export type StageOneResult =
  | {
      kind: "resolved";
      primaryFramework: FrameworkKind;
      kmpSubtype?: KmpSubtype;
      frameworkSignals: string[];
    }
  | {
      kind: "dotnet";
      primaryFramework: "dotnet";
      frameworkSignals: string[];
    }
  | {
      kind: "needs_hybrid_probe";
      frameworkSignals: string[];
    };

function hasExactLib(libs: string[], name: string): boolean {
  return libs.includes(name);
}

/** True Xamarin/Mono .NET Android artifacts — avoid `libmono*` (e.g. libmonochrome). */
function isDotnetStack(libs: string[]): boolean {
  return libs.some((l) => {
    if (DOTNET_NATIVE_LIBS.has(l)) return true;
    const lower = l.toLowerCase();
    if (lower.includes("monosgen") || lower.includes("monodroid")) return true;
    if (lower.startsWith("libmono-native") || lower.startsWith("libmono-btls"))
      return true;
    if (lower.startsWith("libxamarin")) return true;
    return false;
  });
}

function isKmpSkiko(libs: string[]): boolean {
  return libs.some((l) => l.toLowerCase().includes("skiko"));
}

function isReactNativeLibs(libs: string[]): boolean {
  if (
    libs.some((l) =>
      (REACT_NATIVE_LIBRARIES as readonly string[]).includes(l),
    )
  ) {
    return true;
  }
  const lower = libs.map((l) => l.toLowerCase());
  // New Architecture / merged artifacts often include "reactnative" in the .so file name.
  if (lower.some((l) => l.includes("reactnative"))) {
    return true;
  }
  // New Architecture generated JNI (always RN when present).
  if (lower.some((l) => l.includes("react_codegen"))) {
    return true;
  }
  if (lower.some((l) => l === "libexpo-modules-core.so")) {
    return true;
  }
  // Hermes + JSI is the standard RN native stack (avoids tagging Hermes-only shells).
  const hasHermes = lower.some((l) => l.includes("hermes"));
  const hasJsi = lower.some((l) => l === "libjsi.so" || l.startsWith("libjsi."));
  if (hasHermes && hasJsi) {
    return true;
  }
  return false;
}

/**
 * First pass: Flutter → Unity → dotnet → NativeScript → KMP (Skiko) → React Native (libs + Meta allowlist).
 * Does not run Cordova or dotnet assembly probes.
 */
export function classifyStageOne(
  packageName: string,
  nativeLibraries: string[]
): StageOneResult {
  const frameworkSignals: string[] = [];
  const libs = nativeLibraries
    .map((l) => String(l).trim())
    .filter((l) => l.length > 0);

  if (isChromeWebApkPackageId(packageName)) {
    return {
      kind: "resolved",
      primaryFramework: "pwa",
      frameworkSignals: ["org.chromium.webapk"],
    };
  }

  if (hasExactLib(libs, "libflutter.so")) {
    frameworkSignals.push("libflutter.so");
    return {
      kind: "resolved",
      primaryFramework: "flutter",
      frameworkSignals,
    };
  }

  if (hasExactLib(libs, "libunity.so")) {
    frameworkSignals.push("libunity.so");
    return {
      kind: "resolved",
      primaryFramework: "unity",
      frameworkSignals,
    };
  }

  if (isDotnetStack(libs)) {
    libs.forEach((l) => {
      if (DOTNET_NATIVE_LIBS.has(l) || isDotnetStack([l]))
        frameworkSignals.push(l);
    });
    return {
      kind: "dotnet",
      primaryFramework: "dotnet",
      frameworkSignals: [...new Set(frameworkSignals)].slice(0, 12),
    };
  }

  if (hasExactLib(libs, "libNativeScript.so")) {
    frameworkSignals.push("libNativeScript.so");
    return {
      kind: "resolved",
      primaryFramework: "nativescript",
      frameworkSignals,
    };
  }

  if (isKmpSkiko(libs)) {
    const skiko = libs.find((l) => l.toLowerCase().includes("skiko"));
    if (skiko) frameworkSignals.push(skiko);
    return {
      kind: "resolved",
      primaryFramework: "kotlin-multiplatform",
      kmpSubtype: "compose-multiplatform",
      frameworkSignals,
    };
  }

  if (isReactNativeLibs(libs)) {
    REACT_NATIVE_LIBRARIES.forEach((n) => {
      if (hasExactLib(libs, n)) frameworkSignals.push(n);
    });
    libs.forEach((l) => {
      const low = l.toLowerCase();
      if (low.includes("react_codegen")) frameworkSignals.push(l);
    });
    if (libs.some((l) => l.toLowerCase() === "libexpo-modules-core.so")) {
      frameworkSignals.push("libexpo-modules-core.so");
    }
    const lower = libs.map((l) => l.toLowerCase());
    if (
      lower.some((l) => l.includes("hermes")) &&
      lower.some((l) => l === "libjsi.so" || l.startsWith("libjsi."))
    ) {
      frameworkSignals.push("hermes+jsi");
    }
    return {
      kind: "resolved",
      primaryFramework: "react-native",
      frameworkSignals: [...new Set(frameworkSignals)].slice(0, 12),
    };
  }

  if (MANUAL_REACT_NATIVE_PACKAGES.has(packageName)) {
    frameworkSignals.push("manual-meta-rn");
    return {
      kind: "resolved",
      primaryFramework: "react-native",
      frameworkSignals,
    };
  }

  return { kind: "needs_hybrid_probe", frameworkSignals };
}

export function shouldProbeCordovaCapacitor(nativeLibraries: string[]): boolean {
  if (nativeLibraries.length >= LARGE_NATIVE_LIB_COUNT_SKIP_HYBRID) {
    return false;
  }
  return true;
}

export function resolveDotnetSubtypeFromFileHits(
  filePathToFound: Record<string, boolean>
): DotnetSubtype {
  const mauiHit = MAUI_ASSEMBLY_PATHS.some((p) => filePathToFound[p]);
  if (mauiHit) return "maui";
  const xamarinHit = XAMARIN_ASSEMBLY_PATHS.some((p) => filePathToFound[p]);
  if (xamarinHit) return "xamarin";
  return "other";
}

export function dotnetAssemblyProbePaths(): string[] {
  return [...MAUI_ASSEMBLY_PATHS, ...XAMARIN_ASSEMBLY_PATHS];
}

/** After Cordova/Capacitor zip probe: any path matched. */
export function finalizeAfterHybridProbe(
  nativeLibraries: string[],
  hybridMatched: boolean
): { primaryFramework: FrameworkKind; frameworkSignals: string[] } {
  if (hybridMatched) {
    return {
      primaryFramework: "cordova-capacitor",
      frameworkSignals: ["hybrid-asset-probe"],
    };
  }
  if (nativeLibraries.length > 0) {
    return { primaryFramework: "native", frameworkSignals: ["jni-present"] };
  }
  return { primaryFramework: "other", frameworkSignals: ["no-jni-no-hybrid"] };
}

const FRAMEWORK_LABELS: Record<FrameworkKind, string> = {
  flutter: "Flutter",
  unity: "Unity",
  dotnet: ".NET",
  nativescript: "NativeScript",
  "kotlin-multiplatform": "Kotlin Multiplatform",
  "react-native": "React Native",
  "cordova-capacitor": "Cordova / Capacitor",
  pwa: "Chrome WebAPK (PWA)",
  native: "Native (JNI)",
  other: "Other",
};

export function frameworkDisplayName(kind: FrameworkKind): string {
  return FRAMEWORK_LABELS[kind];
}

export function dotnetSubtypeLabel(sub: DotnetSubtype): string {
  switch (sub) {
    case "maui":
      return "MAUI";
    case "xamarin":
      return "Xamarin";
    case "other":
      return ".NET (other)";
    default:
      return sub;
  }
}

export function kmpSubtypeLabel(sub: KmpSubtype): string {
  switch (sub) {
    case "compose-multiplatform":
      return "Compose Multiplatform";
    default:
      return sub;
  }
}
