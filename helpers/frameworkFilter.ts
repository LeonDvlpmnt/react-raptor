import type { DotnetSubtype, FrameworkKind } from "@/helpers/detectFramework";

export type FrameworkFilterKey = string;

export const FRAMEWORK_FILTER_OPTIONS: {
  key: FrameworkFilterKey;
  label: string;
}[] = [
  { key: "flutter", label: "Flutter" },
  { key: "unity", label: "Unity" },
  { key: "dotnet:maui", label: ".NET — MAUI" },
  { key: "dotnet:xamarin", label: ".NET — Xamarin" },
  { key: "dotnet:other", label: ".NET — other" },
  { key: "nativescript", label: "NativeScript" },
  { key: "kotlin-multiplatform", label: "Kotlin Multiplatform" },
  { key: "react-native", label: "React Native" },
  { key: "cordova-capacitor", label: "Cordova / Capacitor" },
  { key: "native", label: "Native (JNI)" },
  { key: "other", label: "Other" },
];

export function defaultFrameworkFilters(): Record<string, boolean> {
  return Object.fromEntries(
    FRAMEWORK_FILTER_OPTIONS.map(({ key }) => [key, true])
  );
}

export function getFrameworkFilterKey(app: {
  primaryFramework: FrameworkKind;
  dotnetSubtype?: DotnetSubtype;
}): FrameworkFilterKey {
  if (app.primaryFramework === "dotnet" && app.dotnetSubtype) {
    return `dotnet:${app.dotnetSubtype}`;
  }
  return app.primaryFramework;
}

export function passesFrameworkFilter(
  app: { primaryFramework: FrameworkKind; dotnetSubtype?: DotnetSubtype },
  filters: Record<string, boolean>
): boolean {
  const key = getFrameworkFilterKey(app);
  return filters[key] !== false;
}
