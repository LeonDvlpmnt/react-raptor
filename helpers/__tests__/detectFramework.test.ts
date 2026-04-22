import {
  MANUAL_REACT_NATIVE_PACKAGES,
  classifyStageOne,
  dotnetAssemblyProbePaths,
  finalizeAfterHybridProbe,
  isChromeWebApkPackageId,
  resolveDotnetSubtypeFromFileHits,
} from "@/helpers/detectFramework";

describe("isChromeWebApkPackageId", () => {
  it("matches Chrome-installed PWA (WebAPK) package prefix", () => {
    expect(isChromeWebApkPackageId("org.chromium.webapk.a1b2c3d4")).toBe(true);
    expect(isChromeWebApkPackageId("ORG.CHROMIUM.WEBAPK.X")).toBe(true);
  });

  it("does not match the Chrome browser or arbitrary apps", () => {
    expect(isChromeWebApkPackageId("com.android.chrome")).toBe(false);
    expect(isChromeWebApkPackageId("com.example.app")).toBe(false);
  });
});

describe("classifyStageOne", () => {
  it("detects Chrome WebAPK by package id before other stacks", () => {
    const r = classifyStageOne("org.chromium.webapk.a1b2c3d4e5f67890", [
      "libflutter.so",
    ]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") expect(r.primaryFramework).toBe("pwa");
  });

  it("detects Flutter", () => {
    const r = classifyStageOne("com.example.app", ["libflutter.so"]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved") expect(r.primaryFramework).toBe("flutter");
  });

  it("detects dotnet stack", () => {
    const r = classifyStageOne("com.example.app", ["libmonosgen-2.0.so"]);
    expect(r.kind).toBe("dotnet");
  });

  it("does not treat libmonochrome as dotnet", () => {
    const r = classifyStageOne("com.example.app", ["libmonochrome.so"]);
    expect(r.kind).toBe("needs_hybrid_probe");
  });

  it("detects React Native via Expo native module .so", () => {
    const r = classifyStageOne("com.example.app", ["libexpo-modules-core.so"]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("react-native");
  });

  it("detects React Native via react_codegen JNI", () => {
    const r = classifyStageOne("com.example.app", [
      "libreact_codegen_rnscreens.so",
    ]);
    expect(r.kind).toBe("resolved");
    if (r.kind === "resolved")
      expect(r.primaryFramework).toBe("react-native");
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
