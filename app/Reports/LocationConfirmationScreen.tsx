import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Header from "../../components/Header";

SplashScreen.preventAutoHideAsync();

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
    position: "relative",
    paddingHorizontal: 16,
  },
  leftSection: {
    width: 40,
    zIndex: 1,
  },
  rightSection: {
    width: 40,
  },
  titleWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: "#1A237E",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    color: "#000000",
    textAlign: "center",
  },
  instructionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#666666",
    marginTop: 10,
  },
  locationSummaryContainer: {
    backgroundColor: "#F8F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  locationTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#1A237E",
    marginBottom: 8,
  },
  locationAddress: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
    marginBottom: 8,
  },
  coordinatesText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#666666",
  },
  confirmButton: {
    backgroundColor: "#1A237E",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  confirmButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  confirmButtonTextDisabled: {
    color: "#888888",
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#1A237E",
  },
  retryButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#1A237E",
  },
});

export default function LocationConfirmationScreen() {
  const params = useLocalSearchParams();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the selected category from params
  const selectedCategory = params.selectedCategory as string;
  const categoryName = params.categoryName as string;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    requestLocationAndGetDetails();
  }, []);

  const requestLocationAndGetDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError(
          "Location permission is required to create reports with accurate location data."
        );
        setIsLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      let addressString = "Location detected";
      if (address && address.length > 0) {
        const addr = address[0];
        const parts = [];
        if (addr.name) parts.push(addr.name);
        if (addr.street) parts.push(addr.street);
        if (addr.district) parts.push(addr.district);
        if (addr.city) parts.push(addr.city);
        if (addr.region) parts.push(addr.region);

        addressString = parts.join(", ");
      }

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: addressString,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      setError(
        "Failed to get your location. Please make sure location services are enabled."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (location) {
      router.push({
        pathname: "/Reports/ReportUploadScreen",
        params: {
          selectedCategory: selectedCategory,
          categoryName: categoryName,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          locationAddress: location.address,
        },
      });
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.titleContainer}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            onPress={() => router.push("/Reports/ReportCategoryScreen")}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Confirm Location</Text>
        </View>
        <View style={styles.rightSection} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          We need to confirm your location to accurately tag your report. Please
          verify that the pin shows your current location.
        </Text>

        <View style={styles.mapContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1A237E" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : error ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={requestLocationAndGetDetails}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : location ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
                description="Report will be tagged to this location"
                pinColor="#1A237E"
              />
            </MapView>
          ) : null}
        </View>

        {location && (
          <View style={styles.locationSummaryContainer}>
            <Text style={styles.locationTitle}>📍 Current Location</Text>
            <Text style={styles.locationAddress}>{location.address}</Text>
            <Text style={styles.coordinatesText}>
              Coordinates: {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!location || isLoading) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmLocation}
          disabled={!location || isLoading}
        >
          <Text
            style={[
              styles.confirmButtonText,
              (!location || isLoading) && styles.confirmButtonTextDisabled,
            ]}
          >
            {isLoading ? "Getting Location..." : "Confirm Location"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
