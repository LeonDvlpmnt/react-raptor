import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

export const LoadingApps = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  useEffect(() => {
    // infinite rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1
    );

    // scale up and down within 2 seconds, do this infinitely
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1000, easing: Easing.quad }),
        withTiming(1, { duration: 1000, easing: Easing.quad })
      ),
      -1
    );
  }, []);

  return (
    <View style={styles.container}>
      <AnimatedImage
        style={[styles.image, animatedStyle]}
        source={require("@/assets/images/react-native.svg")}
        contentFit="contain"
      />

      <Text style={styles.text}>Analyzing apps</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 24,
    marginTop: 40,
  },
});
