import { reactRaptorAppListQueryFn } from "@/hooks/useReactRaptorAppList";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const E2E_ENABLED = process.env.EXPO_PUBLIC_E2E === "1";

function sanitizeRow(
  app: Awaited<ReturnType<typeof reactRaptorAppListQueryFn>>[0],
) {
  return {
    packageName: app.packageName,
    primaryFramework: app.primaryFramework,
    dotnetSubtype: app.dotnetSubtype,
    kmpSubtype: app.kmpSubtype,
    frameworkSignals: app.frameworkSignals,
    sdkHintIds: app.sdkHints.map((h) => h.id),
  };
}

export default function E2eDetectionExportScreen() {
  const [status, setStatus] = useState<string>(
    E2E_ENABLED ? "Scanning…" : "Disabled",
  );

  useEffect(() => {
    if (!E2E_ENABLED) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await reactRaptorAppListQueryFn();
        if (cancelled) return;
        const payload = raw.slice(0, 60).map(sanitizeRow);
        const json = JSON.stringify(payload);
        const line = `ReactRaptorE2E REACT_RAPTOR_DETECTION_JSON:${json}`;
        console.log(line);
        setStatus(`Published ${payload.length} rows to logcat.`);
      } catch (e) {
        console.log(
          "ReactRaptorE2E REACT_RAPTOR_DETECTION_JSON:" +
            JSON.stringify({ error: String(e) }),
        );
        setStatus(`Error: ${String(e)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      {!E2E_ENABLED ? (
        <Text style={styles.text}>
          Set EXPO_PUBLIC_E2E=1 when building the dev client to enable the
          detection export used by adb smoke tests.
        </Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.text}>{status}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191716",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
