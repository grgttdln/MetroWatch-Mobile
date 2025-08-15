import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { router } from "expo-router/build/imperative-api";
import * as SplashScreen from "expo-splash-screen";
import React, { useState } from "react";
import {
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
  pickerContainer: {
    position: "relative",
  },
  dropdownIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    fontSize: 16,
    color: "#666666",
  },
  cityDropdown: {
    position: "absolute",
    top: 88, // Position below the input
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cityOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  cityOptionText: {
    fontFamily: "Inter_400Regular",
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
});

export default function RegisterScreen() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  const cities = ["Manila", "Laguna", "Cavite"];

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
              <Text style={styles.inputLabel}>Select your City</Text>
              <TouchableOpacity 
                style={styles.pickerContainer}
                onPress={() => setShowCityPicker(!showCityPicker)}
              >
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#A0A0A0"
                  value={city}
                  editable={false}
                />
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              
              {showCityPicker && (
                <View style={styles.cityDropdown}>
                  {cities.map((cityOption) => (
                    <TouchableOpacity
                      key={cityOption}
                      style={styles.cityOption}
                      onPress={() => {
                        setCity(cityOption);
                        setShowCityPicker(false);
                      }}
                    >
                      <Text style={styles.cityOptionText}>{cityOption}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
              style={styles.registerButton}
              onPress={() => console.log("Register pressed")}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}