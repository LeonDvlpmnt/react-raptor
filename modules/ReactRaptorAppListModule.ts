import { requireNativeModule } from "expo";

export type AndroidAppListPackage = {
  packageName: string;
  versionName?: string;
  size: number;
  appName: string;
  isSystemApp: boolean;
  firstInstallTime: number;
  lastUpdateTime: number;
  targetSdkVersion: number;
};

export type FileInfo = {
  content: string;
  size: number;
};

type ReactRaptorAppListModule = {
  getAll(): Promise<AndroidAppListPackage[]>;
  getNativeLibraries(packageName: string): Promise<string[]>;
  getFiles(packageName: string, paths: string[]): Promise<(FileInfo | null)[]>;
  getPermissions(packageName: string): Promise<string[]>;
  getPackageDetails(packageName: string): Promise<AndroidAppListPackage | null>;
};

export const ReactRaptorAppList =
  requireNativeModule<ReactRaptorAppListModule>("ReactRaptorAppList");
