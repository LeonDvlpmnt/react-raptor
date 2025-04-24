import { storage } from "@/helpers/storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SettingsStore = {
  hasFinishedOnboarding: boolean;
  setHasFinishedOnboarding: (value: boolean) => void;
  enabledTags: string[];
  toggleTag: (tag: string) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hasFinishedOnboarding: false,
      setHasFinishedOnboarding: (value) => {
        set({ hasFinishedOnboarding: value });
      },
      enabledTags: ["expo-modules", "expo-updates"],
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
    }),
    {
      name: "settings",
      version: 1,
      storage: createJSONStorage(() => ({
        setItem: (key, value) => {
          storage.set(key, value);
        },
        getItem: (key) => {
          const value = storage.getString(key);
          return value === undefined ? null : value;
        },
        removeItem: (key) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clearAll();
        },
      })),
    }
  )
);
