import { ScrollView, Text, View, StyleSheet } from "react-native";

type Props = {
  errorMessage?: string;
};

export const NoResults = (props: Props) => {
  const { errorMessage } = props;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: 15,
        gap: 10,
      }}
    >
      <Text style={styles.title}>No React Native apps found</Text>

      {errorMessage ? (
        <View style={styles.textContainer}>
          <Text style={[styles.text, { fontSize: 12 }]}>{errorMessage}</Text>
        </View>
      ) : null}
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
