import { storage } from "@/helpers/storage";
import {
  defaultFrameworkFilters,
  type FrameworkFilterKey,
} from "@/helpers/frameworkFilter";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SettingsStore = {
  hasFinishedOnboarding: boolean;
  setHasFinishedOnboarding: (value: boolean) => void;
  enabledTags: string[];
  toggleTag: (tag: string) => void;
  /** Per-row framework keys (see frameworkFilter.ts). Omitted keys treated as enabled. */
  frameworkFilters: Record<string, boolean>;
  toggleFrameworkFilter: (key: FrameworkFilterKey) => void;
  setFrameworkFiltersPresetReactNativeOnly: () => void;
  setFrameworkFiltersShowAll: () => void;
  deepSdkScan: boolean;
  setDeepSdkScan: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hasFinishedOnboarding: false,
      setHasFinishedOnboarding: (value) => {
        set({ hasFinishedOnboarding: value });
      },
      enabledTags: ["react-native", "expo-modules"],
      toggleTag: (tag) => {
        set((state) => {
          const isTagEnabled = state.enabledTags.includes(tag);

          return {
            enabledTags: isTagEnabled
              ? state.enabledTags.filter((t) => t !== tag)
              : [...state.enabledTags, tag],
          };
        });
      },
      frameworkFilters: defaultFrameworkFilters(),
      toggleFrameworkFilter: (key) => {
        set((state) => {
          const cur = state.frameworkFilters[key] !== false;
          return {
            frameworkFilters: { ...state.frameworkFilters, [key]: !cur },
          };
        });
      },
      setFrameworkFiltersPresetReactNativeOnly: () => {
        const allOff = defaultFrameworkFilters();
        Object.keys(allOff).forEach((k) => {
          allOff[k] = false;
        });
        allOff["react-native"] = true;
        set({ frameworkFilters: allOff });
      },
      setFrameworkFiltersShowAll: () => {
        set({ frameworkFilters: defaultFrameworkFilters() });
      },
      deepSdkScan: false,
      setDeepSdkScan: (value) => set({ deepSdkScan: value }),
    }),
    {
      name: "settings",
      version: 2,
      migrate: (persistedState, version) => {
        const s = persistedState as Partial<SettingsStore>;
        if (version < 2) {
          return {
            ...s,
            frameworkFilters: {
              ...defaultFrameworkFilters(),
              ...s.frameworkFilters,
            },
            deepSdkScan: s.deepSdkScan ?? false,
          };
        }
        return persistedState as SettingsStore;
      },
      storage: createJSONStorage(() => ({
        setItem: (key, value) => {
          storage.set(key, value);
        },
        getItem: (key) => {
          const value = storage.getString(key);
          return value === undefined ? null : value;
        },
        removeItem: (key) => {
          storage.remove(key);
        },
        clear: () => {
          storage.clearAll();
        },
      })),
    }
  )
);
