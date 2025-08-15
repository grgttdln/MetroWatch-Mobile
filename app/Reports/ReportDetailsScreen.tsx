import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useState } from "react";
import {
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Header from "../../components/Header";

SplashScreen.preventAutoHideAsync();

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  formContainer: {
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#000000",
    justifyContent: "center",
    textAlignVertical: "center",
  },
  inputText: {
    color: "#000000",
    fontFamily: "Inter_500Medium",
  },
  placeholderText: {
    color: "#AAAAAA",
    fontFamily: "Inter_500Medium",
  },
  dropdownContainer: {
    position: "relative",
    justifyContent: "center",
  },
  dropdownButton: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownButtonText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#000000",
  },
  dropdownButtonPlaceholder: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#AAAAAA",
  },
  dropdownIcon: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 8,
  },
  dropdownList: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    zIndex: 1000,
    maxHeight: 180, // Height for exactly 3 items (60px per item)
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  dropdownItemLast: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  dropdownItemSelected: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    backgroundColor: "#F8F9FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  dropdownItemSelectedLast: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    backgroundColor: "#F8F9FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  dropdownItemText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#2C2C2C",
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#1A237E",
    flex: 1,
  },
  dropdownItemIcon: {
    marginLeft: 12,
    fontSize: 18,
    color: "#1A237E",
  },
  dropdownItemPrefix: {
    marginRight: 12,
    fontSize: 16,
    color: "#666666",
    minWidth: 20,
    textAlign: "center",
  },
  dropdownItemPrefixSelected: {
    marginRight: 12,
    fontSize: 16,
    color: "#1A237E",
    minWidth: 20,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
  },
  textArea: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    height: 150,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 14,
    color: "#333333",
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#1A237E",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  sendButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  // Header row styles (match ReportUploadScreen)
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
});

export default function ReportDetailsScreen() {
  // Date and time state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form field values
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationOptions, setLocationOptions] = useState([
    "Manila",
    "Laguna",
    "Cavite",
    "Quezon City",
  ]);

  const [category, setCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([
    "Garbage",
    "Traffic",
    "Flooding",
    "Vandalism",
    "Noise Pollution",
    "Road Damage",
    "Illegal Parking",
    "Street Lighting",
    "Stray Animals",
    "Others",
  ]);

  const [description, setDescription] = useState("");

  // Helper function to get category icons
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      Garbage: "🗑️",
      Traffic: "🚦",
      Flooding: "🌊",
      Vandalism: "⚠️",
      "Noise Pollution": "🔊",
      "Road Damage": "🕳️",
      "Illegal Parking": "🚗",
      "Street Lighting": "💡",
      "Stray Animals": "🐶",
      Others: "📋",
    };
    return iconMap[category] || "📋";
  };

  // Helper function to get location icons
  const getLocationIcon = (location: string) => {
    return "📍";
  };

  // Handle date selection
  const handleConfirmDate = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);

    // Format date to display
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    setDate(formattedDate);
  };

  // Handle time selection
  const handleConfirmTime = (time: Date) => {
    setShowTimePicker(false);
    setSelectedTime(time);

    // Format time to display
    const formattedTime = time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    setTime(formattedTime);
  };

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSendReport = () => {
    console.log("Report sent:", {
      date,
      time,
      location,
      category,
      description,
    });
    // Navigate to next screen or show confirmation
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="MetroWatch" />
      <View style={styles.titleContainer}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            onPress={() => router.push("/Reports/ReportUploadScreen")}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Report Details</Text>
        </View>
        <View style={styles.rightSection} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={date ? styles.inputText : styles.placeholderText}>
                  {date || "Select date"}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setShowDatePicker(false)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={time ? styles.inputText : styles.placeholderText}>
                  {time || "Select time"}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showTimePicker}
                mode="time"
                onConfirm={handleConfirmTime}
                onCancel={() => setShowTimePicker(false)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TouchableOpacity
                onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                style={styles.dropdownButton}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    location
                      ? styles.dropdownButtonText
                      : styles.dropdownButtonPlaceholder
                  }
                >
                  {location || "Select location"}
                </Text>
                <Text style={styles.dropdownIcon}>
                  {showLocationDropdown ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {showLocationDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                  >
                    {locationOptions.map((item, index) => {
                      const isSelected = location === item;
                      const isLast = index === locationOptions.length - 1;

                      let itemStyle;
                      if (isSelected && isLast) {
                        itemStyle = styles.dropdownItemSelectedLast;
                      } else if (isSelected) {
                        itemStyle = styles.dropdownItemSelected;
                      } else if (isLast) {
                        itemStyle = styles.dropdownItemLast;
                      } else {
                        itemStyle = styles.dropdownItem;
                      }

                      return (
                        <TouchableOpacity
                          key={item}
                          style={itemStyle}
                          onPress={() => {
                            setLocation(item);
                            setShowLocationDropdown(false);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={
                              isSelected
                                ? styles.dropdownItemPrefixSelected
                                : styles.dropdownItemPrefix
                            }
                          >
                            {getLocationIcon(item)}
                          </Text>
                          <Text
                            style={
                              isSelected
                                ? styles.dropdownItemTextSelected
                                : styles.dropdownItemText
                            }
                          >
                            {item}
                          </Text>
                          {isSelected && (
                            <Text style={styles.dropdownItemIcon}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={styles.dropdownButton}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    category
                      ? styles.dropdownButtonText
                      : styles.dropdownButtonPlaceholder
                  }
                >
                  {category || "Select category"}
                </Text>
                <Text style={styles.dropdownIcon}>
                  {showCategoryDropdown ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {showCategoryDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                  >
                    {categoryOptions.map((item, index) => {
                      const isSelected = category === item;
                      const isLast = index === categoryOptions.length - 1;

                      let itemStyle;
                      if (isSelected && isLast) {
                        itemStyle = styles.dropdownItemSelectedLast;
                      } else if (isSelected) {
                        itemStyle = styles.dropdownItemSelected;
                      } else if (isLast) {
                        itemStyle = styles.dropdownItemLast;
                      } else {
                        itemStyle = styles.dropdownItem;
                      }

                      return (
                        <TouchableOpacity
                          key={item}
                          style={itemStyle}
                          onPress={() => {
                            setCategory(item);
                            setShowCategoryDropdown(false);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={
                              isSelected
                                ? styles.dropdownItemPrefixSelected
                                : styles.dropdownItemPrefix
                            }
                          >
                            {getCategoryIcon(item)}
                          </Text>
                          <Text
                            style={
                              isSelected
                                ? styles.dropdownItemTextSelected
                                : styles.dropdownItemText
                            }
                          >
                            {item}
                          </Text>
                          {isSelected && (
                            <Text style={styles.dropdownItemIcon}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Enter description here"
                placeholderTextColor="#AAAAAA"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendReport}
          >
            <Text style={styles.sendButtonText}>Send Report</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
