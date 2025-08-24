import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as Location from "expo-location";
import { router } from "expo-router/build/imperative-api";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUser } from "../../services/supabase";

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  appName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    color: "#1A237E",
    marginTop: 10,
    marginBottom: 10,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  registerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#1A237E",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    fontFamily: "Inter_400Regular",
    height: 56,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333333",
  },

  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  loginText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#333333",
  },
  loginLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#1A237E",
  },
  registerButton: {
    backgroundColor: "#1A237E",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  registerButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    paddingVertical: 8,
  },
  locationTextContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  locationText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#333333",
    textAlign: "left",
    marginLeft: 10,
  },
  detectButton: {
    backgroundColor: "#1A237E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    position: "absolute",
    right: 0,
  },
  detectButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#FFFFFF",
  },
  locationStatus: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(
    null
  );

  // Get location and detect city automatically
  const detectLocation = async () => {
    setLocationLoading(true);
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to automatically detect your city."
        );
        setLocationLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        // Use city, or fall back to subregion, region, or district
        const detectedCity =
          address.city ||
          address.subregion ||
          address.region ||
          address.district ||
          "Unknown";
        setCity(detectedCity);
        console.log("Detected city:", detectedCity);
      } else {
        Alert.alert(
          "Location Error",
          "Could not detect your city. Please try again."
        );
      }
    } catch (error) {
      console.error("Location detection error:", error);
      Alert.alert(
        "Location Error",
        "Failed to detect your location. Please check your GPS settings and try again."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !mobile || !password || !confirmPassword || !city) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(name, email, mobile, password, city);

      if (result.success) {
        Alert.alert("Success", "Registration successful! You can now login.", [
          {
            text: "OK",
            onPress: () => router.push("/Auth/LoginScreen"),
          },
        ]);
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo/MetroWatch.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>MetroWatch</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.registerTitle}>Register</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Enter your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#A0A0A0"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Enter your Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Enter your Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#A0A0A0"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Enter your Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm your Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your City</Text>
              <View style={styles.input}>
                <View style={styles.locationContainer}>
                  {locationLoading ? (
                    <View style={styles.locationTextContainer}>
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#1A237E" />
                        <Text style={[styles.locationText, { marginLeft: 8 }]}>
                          Detecting location...
                        </Text>
                      </View>
                    </View>
                  ) : city ? (
                    <>
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationText}>{city}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.detectButton}
                        onPress={detectLocation}
                      >
                        <Text style={styles.detectButtonText}>Refresh</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.locationTextContainer}>
                        <Text
                          style={[styles.locationText, { color: "#A0A0A0" }]}
                        >
                          Location not detected
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.detectButton}
                        onPress={detectLocation}
                      >
                        <Text style={styles.detectButtonText}>Detect</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              {locationPermission === "denied" && (
                <Text style={styles.locationStatus}>
                  Location permission denied. Please enable in device settings.
                </Text>
              )}
              {city && !locationLoading && (
                <Text style={styles.locationStatus}>
                  ✓ Location detected automatically
                </Text>
              )}
            </View>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/Auth/LoginScreen")}
              >
                <Text style={styles.loginLink}>Login here.</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? "Registering..." : "Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
