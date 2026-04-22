# React Raptor

Android app (Expo + Expo Router) that lists **non-system** installed packages and **classifies** them by likely technology stack: React Native / Expo, Flutter, Unity, .NET, NativeScript, Kotlin Multiplatform (Skiko), Cordova / Capacitor, **Chrome WebAPK (PWA)**, plain native JNI, or other.

It is aimed at developers who want a quick read on **what’s on the device**, not a guaranteed store-grade audit.

## Features

- Installed app list with icon, size, version, target SDK, permissions.
- **Framework tag** per app using native `.so` names, optional **APK zip probes** (`hasZipEntries` with exact paths where needed), and package-id heuristics (e.g. `org.chromium.webapk.*` for Chrome-installed PWAs).
- **SDK hints** from library names and (optional deep scan) a few config paths.
- Filters, presets, MMKV-backed settings, detail screen with optional zip-backed hints.

## Monorepo layout

```text
raptor/
  android-app-list/   # local fork of expo-android-app-list (native + TS)
  react-raptor/       # this app
```

The app depends on the module with:

```json
"expo-android-app-list": "file:../android-app-list"
```

After changing **Kotlin** under `android-app-list/android/`, rebuild the dev client (`npx expo run:android`). **TypeScript-only** changes in `react-raptor` reload with Metro.

## Local module & Metro

`react-raptor/metro.config.js` watches the repo parent and blocks resolving `android-app-list/node_modules` so Metro always uses **this app’s** `node_modules`. Use `npm run start:emu` / `npm run android:emu` when the Android **emulator** cannot reach Metro on the LAN IP (`REACT_NATIVE_PACKAGER_HOSTNAME` / `--localhost` + `adb reverse tcp:8081 tcp:8081`).

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

Google Play (when published):  
[React Raptor on Google Play](https://play.google.com/store/apps/details?id=com.leonhh.reactraptor)

## License

See upstream / package metadata for the app; the bundled `expo-android-app-list` fork remains **MIT** unless noted otherwise.
