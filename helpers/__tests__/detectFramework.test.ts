import {
  MANUAL_REACT_NATIVE_PACKAGES,
  classifyStageOne,
  dotnetAssemblyProbePaths,
  finalizeAfterHybridProbe,
  resolveDotnetSubtypeFromFileHits,
} from "@/helpers/detectFramework";

describe("classifyStageOne", () => {
  it("detects Flutter", () => {
    const r = classifyStageOne("com.example.app", ["libflutter.so"]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") expect(r.primaryFramework).toBe("flutter");
  });

  it("detects dotnet stack", () => {
    const r = classifyStageOne("com.example.app", ["libmonosgen-2.0.so"]);
    expect(r.kind).toBe("dotnet");
  });

  it("detects NativeScript", () => {
    const r = classifyStageOne("com.example.app", ["libNativeScript.so"]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("nativescript");
  });

  it("detects Kotlin Multiplatform via Skiko", () => {
    const r = classifyStageOne("com.example.app", [
      "libskiko-android-arm64.so",
    ]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") {
      expect(r.primaryFramework).toBe("kotlin-multiplatform");
      expect(r.kmpSubtype).toBe("compose-multiplatform");
    }
  });

  it("detects React Native libs", () => {
    const r = classifyStageOne("com.example.app", ["libreactnativejni.so"]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("react-native");
  });

  it("detects React Native via merged .so names", () => {
    const r = classifyStageOne("com.example.app", [
      "libreactnativeblob.so",
    ]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("react-native");
  });

  it("detects React Native via New Architecture instance .so", () => {
    const r = classifyStageOne("com.example.app", ["librninstance.so"]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("react-native");
  });

  it("detects React Native via Hermes + JSI stack", () => {
    const r = classifyStageOne("com.example.app", [
      "libhermes.so",
      "libjsi.so",
    ]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("react-native");
  });

  it("detects manual Meta packages as React Native", () => {
    const r = classifyStageOne("com.facebook.katana", []);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("react-native");
    expect(MANUAL_REACT_NATIVE_PACKAGES.has("com.instagram.android")).toBe(
      true
    );
  });

  it("needs hybrid probe when no match", () => {
    const r = classifyStageOne("com.example.app", []);
    expect(r.kind).toBe("needs_hybrid_probe");
  });
});

describe("resolveDotnetSubtypeFromFileHits", () => {
  it("prefers MAUI over Xamarin", () => {
    const paths = dotnetAssemblyProbePaths();
    const map = Object.fromEntries(paths.map((p) => [p, false]));
    map["assemblies/Microsoft.Maui.Controls.dll"] = true;
    map["assemblies/Xamarin.Forms.Core.dll"] = true;
    expect(resolveDotnetSubtypeFromFileHits(map)).toBe("maui");
  });

  it("returns xamarin when only Xamarin sentinels hit", () => {
    const map: Record<string, boolean> = {
      "assemblies/Microsoft.Maui.Controls.dll": false,
      "assemblies/Microsoft.Maui.dll": false,
      "assemblies/Xamarin.Forms.Core.dll": true,
      "assemblies/Xamarin.Forms.Xaml.dll": false,
      "assemblies/Xamarin.Android.Arch.Core.Common.dll": false,
    };
    expect(resolveDotnetSubtypeFromFileHits(map)).toBe("xamarin");
  });

  it("returns other when no assembly hits", () => {
    const map: Record<string, boolean> = {};
    dotnetAssemblyProbePaths().forEach((p) => {
      map[p] = false;
    });
    expect(resolveDotnetSubtypeFromFileHits(map)).toBe("other");
  });
});

describe("finalizeAfterHybridProbe", () => {
  it("classifies cordova when hybrid matched", () => {
    const r = finalizeAfterHybridProbe([], true);
    expect(r.primaryFramework).toBe("cordova-capacitor");
  });

  it("classifies native when JNI present and no hybrid", () => {
    const r = finalizeAfterHybridProbe(["libfoo.so"], false);
    expect(r.primaryFramework).toBe("native");
  });

  it("classifies other when no JNI and no hybrid", () => {
    const r = finalizeAfterHybridProbe([], false);
    expect(r.primaryFramework).toBe("other");
  });
});
