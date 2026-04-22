import { ScrollView, Text, View, StyleSheet } from "react-native";

type Props = {
  errorMessage?: string;
  /** When list is empty because filters hide every row */
  filterEmpty?: boolean;
};

export const NoResults = (props: Props) => {
  const { errorMessage, filterEmpty } = props;

  const title = filterEmpty
    ? "No apps match your filters"
    : errorMessage
      ? "Something went wrong"
      : "No apps to show";

  const subtitle = filterEmpty
    ? "Try widening framework filters in the header menu."
    : errorMessage
      ? errorMessage
      : "No non-system apps were returned, or the scan failed.";

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: 15,
        gap: 10,
      }}
    >
      <Text style={styles.title}>{title}</Text>

      <View style={styles.textContainer}>
        <Text style={styles.text}>{subtitle}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#000",
    textAlign: "center",
  },
  text: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    width: "80%",
  },
});
