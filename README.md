# React Raptor

Android app (Expo + Expo Router) that lists **non-system** installed packages and **classifies** them by likely technology stack: React Native / Expo, Flutter, Unity, .NET, NativeScript, Kotlin Multiplatform (Skiko), Cordova / Capacitor, **Chrome WebAPK (PWA)**, plain native JNI, or other.

It is aimed at developers who want a quick read on **what’s on the device**, not a guaranteed store-grade audit.

## Features

- Installed app list with icon, size, version, target SDK, permissions.
- **Framework tag** per app using native `.so` names, optional **APK zip probes** (`hasZipEntries` with exact paths where needed), and package-id heuristics (e.g. `org.chromium.webapk.*` for Chrome-installed PWAs).
- **SDK hints** from library names and (optional deep scan) a few config paths.
- Filters, presets, MMKV-backed settings, detail screen with optional zip-backed hints.

## Native module

Install the published dependency:

```sh
npx expo install expo-android-app-list
```

Rebuild the Android app after upgrading the module (`npx expo run:android`).

## Metro

If `expo-android-app-list` is resolved from **outside** the app project directory (for example while developing the module from source), ensure Metro’s `watchFolders` includes that package root so bundling resolves correctly. The included `metro.config.js` may already extend `watchFolders` for that layout.

Use `npm run start:emu` / `npm run android:emu` when the Android **emulator** cannot reach Metro on the LAN IP (`REACT_NATIVE_PACKAGER_HOSTNAME` / `--localhost` plus `adb reverse tcp:8081 tcp:8081`).

## Tech stack

- [Expo SDK 54](https://expo.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/)
- [@tanstack/react-query](https://tanstack.com/query/latest) for scanning / caching
- [zustand](https://github.com/pmndrs/zustand) + [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) for persisted UI state
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Expo dev server (default LAN host) |
| `npm run start:emu` | Dev server bound to **localhost** (use with emulator + `adb reverse`) |
| `npm run android` | `expo run:android` |
| `npm run android:emu` | Android build with **`REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1`** for emulators |
| `npm test` | Jest (framework / SDK hint unit tests) |
| `npm run test:adb-detection` | Device smoke (needs E2E build + app on device) |

## Store listing

[React Raptor on Google Play](https://play.google.com/store/apps/details?id=com.leonhh.reactraptor)

## License

See the app’s package metadata and license file for terms. The `expo-android-app-list` dependency is published under **MIT** unless its package states otherwise.
