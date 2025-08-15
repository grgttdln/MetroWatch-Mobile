import React from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import Header from "../../components/Header";
import AppTabs from "../../navigation/AppTabs";

export default function MyImpactScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>My Impact</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.subtitle}>Track your environmental contributions</Text>
            <Text style={styles.description}>
              See how your reports and actions are making a difference in your community.
            </Text>
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
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  titleWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E",
    textAlign: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});