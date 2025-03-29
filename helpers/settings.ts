import { storage } from "@/helpers/storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SettingsStore = {
  hasFinishedOnboarding: boolean;
  setHasFinishedOnboarding: (value: boolean) => void;
  showNewArchitectureTag: boolean;
  setShowNewArchitectureFlag: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hasFinishedOnboarding: false,
      setHasFinishedOnboarding: (value) => {
        set({ hasFinishedOnboarding: value });
      },
      showNewArchitectureTag: true,
      setShowNewArchitectureFlag: (value) => {
        set({ showNewArchitectureTag: value });
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
