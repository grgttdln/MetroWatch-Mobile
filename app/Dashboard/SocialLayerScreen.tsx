import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import AppTabs from "../../navigation/AppTabs";

export default function SocialLayerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Community Feed</Text>
          </View>
        </View>
        <AppTabs />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  titleWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E",
    textAlign: "center",
  },
});
