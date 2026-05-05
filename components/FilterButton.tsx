import { Host, Icon, IconButton } from "@expo/ui/jetpack-compose";
import { router } from "expo-router";

export const FilterButton = () => {
  return (
    <Host matchContents>
      <IconButton
        onClick={() => {
          router.navigate("/(app)/filter");
        }}
        colors={{ contentColor: "#ffffff" }}
      >
        <Icon
          source={require("@/assets/icons/options.xml")}
          size={24}
          tint="#ffffff"
          contentDescription="Filter"
        />
      </IconButton>
    </Host>
  );
};
