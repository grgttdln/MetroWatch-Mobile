import { Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const Header: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo/MetroWatch.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>MetroWatch</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginRight: 10,
  },
  logoText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: "#1A237E",
  },
});

export default Header;
