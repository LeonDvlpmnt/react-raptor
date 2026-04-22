import type { FrameworkKind } from "@/helpers/detectFramework";

export type SdkHintKind = "backend" | "ui" | "analytics" | "other";
export type SdkHintConfidence = "low" | "medium";
export type SdkHintSource = "nativeLib" | "assetFile" | "parsedConfig";

export type SdkHint = {
  id: string;
  kind: SdkHintKind;
  confidence: SdkHintConfidence;
  source: SdkHintSource;
};

const LIB_HINT_RULES: Array<{
  id: string;
  kind: SdkHintKind;
  test: (lower: string) => boolean;
}> = [
  {
    id: "firebase-artifacts",
    kind: "backend",
    test: (l) => l.includes("firebase") || l.includes("libfirebase"),
  },
  { id: "crashlytics", kind: "analytics", test: (l) => l.includes("crashlytics") },
  { id: "play-services", kind: "backend", test: (l) => l.includes("play-services") },
  { id: "sentry", kind: "analytics", test: (l) => l.includes("sentry") },
  { id: "realm", kind: "backend", test: (l) => l.includes("realm") },
  { id: "sqlcipher", kind: "backend", test: (l) => l.includes("sqlcipher") },
  { id: "datadog", kind: "analytics", test: (l) => l.includes("datadog") },
  { id: "amplitude", kind: "analytics", test: (l) => l.includes("amplitude") },
  { id: "segment", kind: "analytics", test: (l) => l.includes("segment") },
  { id: "appsflyer", kind: "analytics", test: (l) => l.includes("appsflyer") },
  { id: "branch-io", kind: "analytics", test: (l) => l.includes("branch") },
  { id: "mapbox", kind: "backend", test: (l) => l.includes("mapbox") },
  { id: "stripe", kind: "backend", test: (l) => l.includes("stripe") },
  {
    id: "react-native-fabric",
    kind: "ui",
    test: (l) => l.includes("libreactnative") && l.includes("fabric"),
  },
];

/** Cheap scan of native library file names (no extra I/O). */
export function inferSdkHintsTierA(nativeLibraries: string[]): SdkHint[] {
  const seen = new Set<string>();
  const out: SdkHint[] = [];
  for (const lib of nativeLibraries) {
    const lower = lib.toLowerCase();
    for (const rule of LIB_HINT_RULES) {
      if (rule.test(lower) && !seen.has(rule.id)) {
        seen.add(rule.id);
        out.push({
          id: rule.id,
          kind: rule.kind,
          confidence: "medium",
          source: "nativeLib",
        });
      }
    }
  }
  return out;
}

export type TierBContext = {
  primaryFramework: FrameworkKind;
  /** Path -> exists from hasZipEntries */
  zipPresence?: Record<string, boolean>;
  /** Raw app.config JSON for RN/Expo — only hosts extracted, never surfaced raw */
  expoConfigRaw?: string | null;
  capacitorConfigRaw?: string | null;
};

const BACKEND_ZIP_PATHS: Array<{ path: string; id: string }> = [
  { path: "google-services.json", id: "google-services-json-present" },
  { path: "amplifyconfiguration.json", id: "amplify-config-present" },
  { path: "awsconfiguration.json", id: "aws-config-present" },
];

export const TIER_B_BACKEND_ZIP_PATHS = BACKEND_ZIP_PATHS.map((x) => x.path);

/** Targeted probes; call only from detail / deep-scan to limit zip I/O. */
export function inferSdkHintsTierB(ctx: TierBContext): SdkHint[] {
  const out: SdkHint[] = [];
  if (ctx.zipPresence) {
    for (const { path, id } of BACKEND_ZIP_PATHS) {
      if (ctx.zipPresence[path]) {
        out.push({
          id,
          kind: "backend",
          confidence: "low",
          source: "assetFile",
        });
      }
    }
  }

  if (
    ctx.primaryFramework === "react-native" &&
    ctx.expoConfigRaw &&
    ctx.expoConfigRaw.length > 0
  ) {
    for (const host of extractSupabaseHosts(ctx.expoConfigRaw)) {
      out.push({
        id: `supabase-host:${host}`,
        kind: "backend",
        confidence: "low",
        source: "parsedConfig",
      });
    }
  }

  if (ctx.capacitorConfigRaw && ctx.capacitorConfigRaw.length > 0) {
    for (const host of extractSupabaseHosts(ctx.capacitorConfigRaw)) {
      out.push({
        id: `supabase-host:${host}`,
        kind: "backend",
        confidence: "low",
        source: "parsedConfig",
      });
    }
  }

  return dedupeHints(out);
}

function dedupeHints(hints: SdkHint[]): SdkHint[] {
  const seen = new Set<string>();
  return hints.filter((h) => {
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  });
}

/** Returns redacted hostnames only (e.g. projectref.supabase.co). */
export function extractSupabaseHosts(text: string): string[] {
  const hosts = new Set<string>();
  const re = /https?:\/\/([a-z0-9-]+)\.supabase\.co/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    hosts.add(`${m[1].toLowerCase()}.supabase.co`);
  }
  return [...hosts];
}
