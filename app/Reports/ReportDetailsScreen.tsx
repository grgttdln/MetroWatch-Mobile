import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import React, { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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
    fontFamily: "Inter_400Regular",
  },
  placeholderText: {
    color: "#AAAAAA",
    fontFamily: "Inter_400Regular",
  },
  dropdownContainer: {
    position: "relative",
    justifyContent: "center",
  },
  dropdownIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    fontSize: 16,
    color: "#666666",
  },
  dropdownList: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  dropdownItemText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#333333",
  },
  textArea: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    height: 150,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 16,
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
  const [locationOptions, setLocationOptions] = useState(["Manila", "Laguna", "Cavite", "Quezon City", "Makati"]);
  
  const [category, setCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(["Garbage", "Traffic", "Flooding", "Vandalism", "Others"]);
  
  const [description, setDescription] = useState("");
  
  // Handle date selection
  const handleConfirmDate = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    
    // Format date to display
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    setDate(formattedDate);
  };
  
  // Handle time selection
  const handleConfirmTime = (time: Date) => {
    setShowTimePicker(false);
    setSelectedTime(time);
    
    // Format time to display
    const formattedTime = time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
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
    console.log("Report sent:", { date, time, location, category, description });
    // Navigate to next screen or show confirmation
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Report Details" />
      
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
            >
              <View style={styles.dropdownContainer}>
                <Text style={[styles.input, location ? styles.inputText : styles.placeholderText]}>
                  {location || "Select location"}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </View>
            </TouchableOpacity>
            
            {showLocationDropdown && (
              <View style={styles.dropdownList}>
                <FlatList
                  data={locationOptions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setLocation(item);
                        setShowLocationDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <View style={styles.dropdownContainer}>
                <Text style={[styles.input, category ? styles.inputText : styles.placeholderText]}>
                  {category || "Select category"}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </View>
            </TouchableOpacity>
            
            {showCategoryDropdown && (
              <View style={styles.dropdownList}>
                <FlatList
                  data={categoryOptions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategory(item);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
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
              numberOfLines={5}
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
  