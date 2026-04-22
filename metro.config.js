const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
/** Parent directory included so Metro can follow packages resolved outside `projectRoot`. */
const extraWatchRoot = path.resolve(projectRoot, "..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [extraWatchRoot];

// If the native module ships its own `node_modules` (common during module development),
// ignore that tree so React Native resolves from this app’s `node_modules` only.
config.resolver.blockList = [/[/\\]android-app-list[/\\]node_modules[/\\].*/];

module.exports = config;
