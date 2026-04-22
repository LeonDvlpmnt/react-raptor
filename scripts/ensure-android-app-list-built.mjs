/**
 * If `expo-android-app-list` is consumed from a sibling source checkout and `build/` is
 * missing (often gitignored), build it once so Metro can resolve the package entry.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const libRoot = join(root, "..", "android-app-list");
const marker = join(libRoot, "build", "index.js");

if (existsSync(marker)) {
  process.exit(0);
}

console.warn(
  "[react-raptor] Building expo-android-app-list from source (first install or clean checkout)…"
);
execSync("npm install --legacy-peer-deps && npm run build", {
  cwd: libRoot,
  stdio: "inherit",
});
