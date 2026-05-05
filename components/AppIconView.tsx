import { requireNativeView } from "expo";
import { type ViewProps } from "react-native";

export type AppIconViewProps = {
  packageName: string;
} & ViewProps;

const NativeAppIconView = requireNativeView<AppIconViewProps>("AppIcon");

export function AppIconView(props: AppIconViewProps) {
  return <NativeAppIconView {...props} />;
}
