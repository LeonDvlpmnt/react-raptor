import { Column, Host, Text } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";

type Props = {
  errorMessage?: string;
};

export const NoResults = (props: Props) => {
  const { errorMessage } = props;

  return (
    <Host style={{ flex: 1 }} colorScheme="light">
      <Column
        horizontalAlignment="center"
        verticalArrangement={{ spacedBy: 10 }}
        modifiers={[fillMaxSize(), padding(16, 15, 16, 16)]}
      >
        <Text
          color="#000000"
          style={{
            typography: "headlineSmall",
            fontWeight: "700",
            textAlign: "center",
          }}
          modifiers={[fillMaxWidth()]}
        >
          No React Native apps found
        </Text>

        {errorMessage ? (
          <Text
            color="#000000"
            style={{ typography: "bodySmall", textAlign: "center" }}
            modifiers={[fillMaxWidth()]}
          >
            {errorMessage}
          </Text>
        ) : null}
      </Column>
    </Host>
  );
};
