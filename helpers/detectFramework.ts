/** Ordered native-library + asset classification (see product plan). */

export type FrameworkKind =
  | "flutter"
  | "unity"
  | "dotnet"
  | "nativescript"
  | "kotlin-multiplatform"
  | "react-native"
  | "cordova-capacitor"
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

/** Android RN apps ship the JS bundle here (Hermes bytecode uses the same path). */
export const REACT_NATIVE_ASSET_PROBE_PATHS = [
  "assets/index.android.bundle",
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

const LARGE_NATIVE_LIB_COUNT_SKIP_HYBRID = 120;

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

function isDotnetStack(libs: string[]): boolean {
  return libs.some(
    (l) =>
      DOTNET_NATIVE_LIBS.has(l) ||
      l.startsWith("libmono") ||
      l.includes("libmonosgen")
  );
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

  if (hasExactLib(nativeLibraries, "libflutter.so")) {
    frameworkSignals.push("libflutter.so");
    return {
      kind: "resolved",
      primaryFramework: "flutter",
      frameworkSignals,
    };
  }

  if (hasExactLib(nativeLibraries, "libunity.so")) {
    frameworkSignals.push("libunity.so");
    return {
      kind: "resolved",
      primaryFramework: "unity",
      frameworkSignals,
    };
  }

  if (isDotnetStack(nativeLibraries)) {
    nativeLibraries.forEach((l) => {
      if (DOTNET_NATIVE_LIBS.has(l) || l.startsWith("libmono"))
        frameworkSignals.push(l);
    });
    return {
      kind: "dotnet",
      primaryFramework: "dotnet",
      frameworkSignals: [...new Set(frameworkSignals)].slice(0, 12),
    };
  }

  if (hasExactLib(nativeLibraries, "libNativeScript.so")) {
    frameworkSignals.push("libNativeScript.so");
    return {
      kind: "resolved",
      primaryFramework: "nativescript",
      frameworkSignals,
    };
  }

  if (isKmpSkiko(nativeLibraries)) {
    const skiko = nativeLibraries.find((l) => l.toLowerCase().includes("skiko"));
    if (skiko) frameworkSignals.push(skiko);
    return {
      kind: "resolved",
      primaryFramework: "kotlin-multiplatform",
      kmpSubtype: "compose-multiplatform",
      frameworkSignals,
    };
  }

  if (isReactNativeLibs(nativeLibraries)) {
    REACT_NATIVE_LIBRARIES.forEach((n) => {
      if (hasExactLib(nativeLibraries, n)) frameworkSignals.push(n);
    });
    return {
      kind: "resolved",
      primaryFramework: "react-native",
      frameworkSignals,
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
