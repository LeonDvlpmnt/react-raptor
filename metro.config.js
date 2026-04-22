const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// `expo-android-app-list` is linked via `file:../android-app-list` (outside this app root).
// Without watchFolders, Metro cannot resolve that package and reports UnableToResolveError.
config.watchFolders = [monorepoRoot];

// When the fork has its own `node_modules` (from `expo-module` dev installs), Metro resolves
// `react` / `expo-modules-core` from there and breaks. Ignore that tree so deps come from
// this app's `node_modules` only.
config.resolver.blockList = [/[/\\]android-app-list[/\\]node_modules[/\\].*/];

module.exports = config;
