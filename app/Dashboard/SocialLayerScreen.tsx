import { router } from "expo-router";
import React from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
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
          <View style={styles.buttonContainer}>
            <Button
              title="Go to Upload"
              onPress={() => router.push("/Reports/ReportUploadScreen")}
            />
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
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    color: "#000000",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 25,
  },
});
