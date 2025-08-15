import React from "react";

import { StyleSheet, Text, View } from "react-native";

export default function SocialLayerScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Social Layer</Text>
      </View>
    </View>
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
});
