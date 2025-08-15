import React, { useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import Header from "../../components/Header";

export default function IncentiveClaimScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const viewShotRef = useRef<ViewShot>(null);
  
  // Get incentive details from navigation params
  const incentiveName = params.incentiveName as string || "Incentive";
  const incentivePoints = params.incentivePoints as string || "0";
  
  // Generate QR code data
  const qrData = JSON.stringify({
    incentive: incentiveName,
    points: incentivePoints,
    claimedAt: new Date().toISOString(),
    validUntil: "December 31, 2025",
    location: "City Municipal Hall"
  });

  const handleBackPress = () => {
    // Show modal asking to take screenshot
    Alert.alert(
      "Save Voucher",
      "Would you like to save this voucher before leaving?",
      [
        {
          text: "No, go back",
          style: "cancel",
          onPress: () => router.push('/Incentives/IncentiveCollectionScreen')
        },
        {
          text: "Save Screenshot",
          onPress: handleSaveScreenshot
        }
      ]
    );
  };

  const handleSaveScreenshot = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please grant permission to save photos to your gallery.");
        return;
      }

      // Capture screenshot
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(uri);
        
        Alert.alert(
          "Success!",
          "Voucher saved to your photo gallery!",
          [
            {
              text: "OK",
              onPress: () => router.push('/Incentives/IncentiveCollectionScreen')
            }
          ]
        );
      } else {
        Alert.alert("Error", "Unable to capture screenshot. Please try again.");
      }
    } catch (error) {
      console.error('Error saving screenshot:', error);
      Alert.alert("Error", "Failed to save screenshot. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />
      
      <ViewShot 
        ref={viewShotRef} 
        style={styles.vouchersContainer}
        options={{ 
          format: "png", 
          quality: 0.9,
          result: "tmpfile"
        }}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Claim your Incentive</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Congratulations message */}
          <Text style={styles.congratsText}>Congratulations!</Text>
          
          {/* Instructions */}
          <Text style={styles.instructionText}>
            Present this QR code to claim your{'\n'}incentive.
          </Text>
          <Text style={styles.locationText}>
            Claim this at the City Municipal Hall.
          </Text>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </View>

          {/* Incentive details */}
          <Text style={styles.incentiveName}>{incentiveName}</Text>
          <Text style={styles.validityText}>Valid until December 31, 2025.</Text>
        </View>
      </ViewShot>

      {/* Save button - Outside ViewShot so it doesn't appear in screenshot */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveScreenshot}>
          <Ionicons name="download-outline" size={20} color="#FFFFFF" style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>Save Voucher</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  vouchersContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
    backgroundColor: "#FFFFFF",
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 30,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incentiveName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  validityText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
