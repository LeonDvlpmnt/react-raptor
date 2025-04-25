import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export const ClearableTextInput = (props: Props) => {
  const { value, onChangeText, placeholder = "Search..." } = props;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearButton}
        >
          <Ionicons name="close" size={24} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 36, // space for clear button
    borderRadius: 8,
    margin: 10,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 32,
  },
});
