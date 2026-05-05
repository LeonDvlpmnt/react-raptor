import {
  Host,
  Icon,
  OutlinedTextField,
  Text,
  type TextFieldRef,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRef } from "react";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export const ClearableTextInput = (props: Props) => {
  const { value, onChangeText, placeholder = "Search..." } = props;
  const textFieldRef = useRef<TextFieldRef>(null);

  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <OutlinedTextField
        ref={textFieldRef}
        onValueChange={onChangeText}
        singleLine
        keyboardOptions={{
          autoCorrectEnabled: false,
          imeAction: "search",
        }}
        modifiers={[fillMaxWidth(), padding(10, 10, 10, 6)]}
      >
        <OutlinedTextField.Placeholder>
          <Text color="#888888">{placeholder}</Text>
        </OutlinedTextField.Placeholder>

        {value.length > 0 ? (
          <OutlinedTextField.TrailingIcon>
            <Icon
              source={require("@/assets/icons/close.xml")}
              size={24}
              tint="#666666"
              contentDescription="Clear search"
              modifiers={[
                clickable(() => {
                  textFieldRef.current?.setText("");
                  onChangeText("");
                }),
              ]}
            />
          </OutlinedTextField.TrailingIcon>
        ) : null}
      </OutlinedTextField>
    </Host>
  );
};
