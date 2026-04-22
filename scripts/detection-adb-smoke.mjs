#!/usr/bin/env node
/**
 * Opt-in device smoke: clears logcat, opens react-raptor://__e2e (requires EXPO_PUBLIC_E2E=1 build),
 * waits for REACT_RAPTOR_DETECTION_JSON in logcat, validates payload, prints SUMMARY.
 *
 * Env: ANDROID_SERIAL (optional), ANDROID_PACKAGE (default com.leonhh.reactraptor), ANDROID_APK optional
 */

import { execFileSync } from "node:child_process";

const PKG = process.env.ANDROID_PACKAGE || "com.leonhh.reactraptor";
const TIMEOUT_MS = Number(process.env.DETECTION_SMOKE_TIMEOUT_MS || 120000);
const POLL_MS = 2000;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function adb(args) {
  return execFileSync("adb", args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function parsePayloadFromLog(log) {
  const marker = "REACT_RAPTOR_DETECTION_JSON:";
  const lines = log.split("\n");
  let last = null;
  for (const line of lines) {
    const i = line.indexOf(marker);
    if (i >= 0) {
      last = line.slice(i + marker.length).trim();
    }
  }
  if (!last) return null;
  try {
    return JSON.parse(last);
  } catch {
    return null;
  }
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Payload must be a non-empty array");
  }
  for (const r of rows) {
    if (!r || typeof r.packageName !== "string") {
      throw new Error("Row missing packageName");
    }
    if (!r.primaryFramework || typeof r.primaryFramework !== "string") {
      throw new Error("Row missing primaryFramework");
    }
  }
}

function summarize(rows) {
  const counts = {};
  for (const r of rows) {
    counts[r.primaryFramework] = (counts[r.primaryFramework] || 0) + 1;
  }
  return counts;
}

async function main() {
  try {
    adb(["wait-for-device"]);
  } catch (e) {
    console.error("adb wait-for-device failed:", e.message);
    process.exit(1);
  }

  const apk = process.env.ANDROID_APK;
  if (apk) {
    console.error("Installing", apk);
    adb(["install", "-r", apk]);
  }

  try {
    adb(["logcat", "-c"]);
  } catch {
    // ignore
  }

  console.error("Starting E2E deep link…");
  adb([
    "shell",
    "am",
    "start",
    "-W",
    "-a",
    "android.intent.action.VIEW",
    "-d",
    "react-raptor://__e2e",
    PKG,
  ]);

  const deadline = Date.now() + TIMEOUT_MS;
  let payload = null;
  while (Date.now() < deadline) {
    const log = adb(["logcat", "-d", "-v", "brief"]);
    payload = parsePayloadFromLog(log);
    if (payload && !payload.error) break;
    await delay(POLL_MS);
  }

  if (!payload) {
    console.error("Timed out waiting for REACT_RAPTOR_DETECTION_JSON");
    process.exit(1);
  }
  if (payload.error) {
    console.error("App reported error payload:", payload.error);
    process.exit(1);
  }

  try {
    validateRows(payload);
  } catch (e) {
    console.error("Validation failed:", e.message);
    process.exit(1);
  }

  const summary = summarize(payload);
  console.log("SUMMARY primaryFramework counts:", JSON.stringify(summary, null, 2));
  console.log(
    "SAMPLE_PACKAGES:",
    payload
      .slice(0, 5)
      .map((r) => r.packageName)
      .join(", ")
  );
  console.log("ROW_COUNT:", String(payload.length));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
