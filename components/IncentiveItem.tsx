import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface IncentiveItemProps {
  title: string;
  pointsRequired: number;
  userPoints: number;
  image?: any; // Changed to any to handle both require() and string URLs
  onRedeem: () => void;
}

export default function IncentiveItem({
  title,
  pointsRequired,
  userPoints,
  image,
  onRedeem,
}: IncentiveItemProps) {
  const canRedeem = userPoints >= pointsRequired;

  return (
    <View style={styles.container}>
      {/* Image Placeholder */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={typeof image === "string" ? { uri: image } : image}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Points and Redeem Button Container */}
      <View style={styles.bottomContainer}>
        <Text style={styles.pointsText}>
          Redeem for {pointsRequired} Points
        </Text>

        <TouchableOpacity
          style={[
            styles.redeemButton,
            !canRedeem && styles.redeemButtonDisabled,
          ]}
          onPress={onRedeem}
          disabled={!canRedeem}
        >
          <Text
            style={[
              styles.redeemButtonText,
              !canRedeem && styles.redeemButtonTextDisabled,
            ]}
          >
            Redeem
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#C4C4C4",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  redeemButton: {
    backgroundColor: "#002697",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  redeemButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  redeemButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  redeemButtonTextDisabled: {
    color: "#999999",
  },
});
