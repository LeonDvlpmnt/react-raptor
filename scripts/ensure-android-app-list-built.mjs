/**
 * When using file:../android-app-list, the module's build/ output is gitignored.
 * Build it once if missing so Metro can resolve expo-android-app-list.
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
  "[react-raptor] Building local expo-android-app-list (first install or clean checkout)…"
);
execSync("npm install --legacy-peer-deps && npm run build", {
  cwd: libRoot,
  stdio: "inherit",
});
