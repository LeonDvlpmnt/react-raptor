import {
  extractSupabaseHosts,
  inferSdkHintsTierA,
  inferSdkHintsTierB,
} from "@/helpers/inferSdkHints";

describe("inferSdkHintsTierA", () => {
  it("maps firebase native lib", () => {
    const hints = inferSdkHintsTierA(["libfirebasecrashlytics.so"]);
    expect(hints.some((h) => h.id === "firebase-artifacts")).toBe(true);
  });
});

describe("extractSupabaseHosts", () => {
  it("extracts redacted supabase hosts only", () => {
    const hosts = extractSupabaseHosts(
      '{"x":"https://AbC.supabase.co/rest/v1"}'
    );
    expect(hosts).toContain("abc.supabase.co");
  });
});

describe("inferSdkHintsTierB", () => {
  it("adds google-services hint when zip presence true", () => {
    const hints = inferSdkHintsTierB({
      primaryFramework: "native",
      zipPresence: { "google-services.json": true },
    });
    expect(hints.some((h) => h.id === "google-services-json-present")).toBe(
      true
    );
  });
});
