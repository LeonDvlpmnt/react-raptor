import { execSync } from "node:child_process";
import path from "node:path";

const run = process.env.RUN_ADB_DETECTION === "1";
const d = run ? describe : describe.skip;

d("adb detection smoke script", () => {
  it("runs scripts/detection-adb-smoke.mjs and prints SUMMARY", () => {
    const root = path.join(__dirname, "..");
    const out = execSync("node scripts/detection-adb-smoke.mjs", {
      encoding: "utf8",
      cwd: root,
      env: process.env,
    });
    console.log(out);
    expect(out).toContain("SUMMARY");
    expect(out).toContain("ROW_COUNT:");
  });
});
