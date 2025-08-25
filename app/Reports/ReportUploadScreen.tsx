import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import { createReport, uploadImage } from "../../services/supabase";

SplashScreen.preventAutoHideAsync();

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

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
  uploadArea: {
    borderWidth: 2,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadAreaWithImages: {
    height: 200,
    marginBottom: 16,
  },
  uploadAreaWithFewImages: {
    height: 300,
    marginBottom: 18,
  },
  uploadAreaEmpty: {
    height: 400,
    marginBottom: 20,
  },
  uploadIconContainer: {
    marginBottom: 20,
  },
  cloudIconContainer: {
    position: "relative",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  cloudIcon: {
    fontSize: 60,
  },
  arrowIcon: {
    position: "absolute",
    fontSize: 24,
    fontWeight: "bold",
    top: 28,
  },
  browseText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
    textDecorationLine: "underline",
  },
  supportedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#333333",
    marginBottom: 4,
  },
  limitText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#333333",
  },
  selectedFileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  selectedFileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  fileNameWrapper: {
    flex: 1,
  },
  fileName: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#333333",
    flexShrink: 1,
  },
  deleteButton: {
    padding: 5,
  },
  deleteIcon: {
    fontSize: 20,
  },
  continueButton: {
    backgroundColor: "#1A237E",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  continueButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  continueButtonTextDisabled: {
    color: "#888888",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#333333",
    marginBottom: 12,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
  },
  descriptionInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 14,
    color: "#333333",
    textAlignVertical: "top",
    height: 120,
    backgroundColor: "#FFFFFF",
  },
  locationSummary: {
    backgroundColor: "#F8F9FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  locationSummaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#1A237E",
    textAlign: "center",
  },
  categorySummary: {
    backgroundColor: "#F0F8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  categorySummaryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#2E7D32",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#1A237E",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  submitButtonTextDisabled: {
    color: "#888888",
  },
});

export default function ReportUploadScreen() {
  const params = useLocalSearchParams();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from params (from LocationConfirmationScreen)
  const selectedCategory = params.selectedCategory as string;
  const categoryName = params.categoryName as string;
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);
  const locationAddress = params.locationAddress as string;

  const locationData: LocationData = {
    latitude,
    longitude,
    address: locationAddress,
  };

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

  if (!fontsLoaded) {
    return null;
  }

  const ensureLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };

  const ensureCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const pickImage = async () => {
    if (selectedImages.length >= 3) {
      Alert.alert(
        "Upload limit reached",
        "You can only upload up to 3 images."
      );
      return;
    }
    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) {
      Alert.alert("Permission required", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      allowsEditing: false,
      exif: false,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => {
        const uriParts = asset.uri.split("/");
        const name = uriParts[uriParts.length - 1];

        return {
          uri: asset.uri,
          name: name,
          type: `image/${name.split(".")[1]}`,
        };
      });

      const availableSlots = 3 - selectedImages.length;
      const imagesToAdd = newImages.slice(0, Math.max(availableSlots, 0));
      if (newImages.length > availableSlots) {
        Alert.alert(
          "Upload limit reached",
          `Only the first ${imagesToAdd.length} image(s) were added. You can upload up to 3 images total.`
        );
      }
      if (imagesToAdd.length > 0) {
        setSelectedImages([...selectedImages, ...imagesToAdd]);
      }
    }
  };

  const takePhoto = async () => {
    if (selectedImages.length >= 3) {
      Alert.alert(
        "Upload limit reached",
        "You can only upload up to 3 images."
      );
      return;
    }
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission required", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      aspect: [4, 3],
      quality: 0.8,
      allowsEditing: false,
      exif: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uriParts = asset.uri.split("/");
      let name =
        (asset as any).fileName ||
        uriParts[uriParts.length - 1] ||
        `photo-${Date.now()}.jpg`;
      const ext = name && name.includes(".") ? name.split(".").pop() : "jpg";
      const image = {
        uri: asset.uri,
        name,
        type: `image/${ext}`,
      } as SelectedImage;
      setSelectedImages([...selectedImages, image].slice(0, 3));
    }
  };

  const pickImageSource = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Add a Photo",
          options: ["Camera", "Photo Library", "Cancel"],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) takePhoto();
          if (buttonIndex === 1) pickImage();
        }
      );
    } else {
      Alert.alert("Add a Photo", "Choose a source", [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  const handleSubmitReport = async () => {
    console.log("🚀 Starting report submission...");

    // Validate required fields
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description for your report");
      return;
    }

    if (!selectedImages || selectedImages.length === 0) {
      Alert.alert("Error", "At least one image is required to create a report");
      return;
    }

    console.log("✅ Form validation passed");

    setIsSubmitting(true);

    try {
      console.log("📷 Starting image upload process...");
      console.log("🖼️ Number of images to upload:", selectedImages.length);

      // Upload images first
      const imageUrls = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        console.log(
          `📸 Uploading image ${i + 1}/${selectedImages.length}:`,
          image.name
        );

        const uploadResult = await uploadImage(image.uri, image.name);
        if (uploadResult.success) {
          console.log(
            `✅ Image ${i + 1} uploaded successfully:`,
            uploadResult.url
          );
          imageUrls.push(uploadResult.url);
        } else {
          console.error(
            `❌ Failed to upload image ${i + 1}:`,
            uploadResult.error
          );
          Alert.alert("Error", `Failed to upload image: ${uploadResult.error}`);
          setIsSubmitting(false);
          return;
        }
      }
      console.log("📷 All images uploaded successfully!");

      // Create report data with automatic date/time and location from previous screen
      const now = new Date();
      const reportData = {
        date: now.toISOString().split("T")[0], // Current date
        time: now.toTimeString().split(" ")[0], // Current time
        location: locationData.address,
        category: categoryName,
        description: description.trim(),
        url: imageUrls.join(","),
        latitude: locationData.latitude.toString(),
        longitude: locationData.longitude.toString(),
        upvote: 0,
        downvote: 0,
        severity: "Low",
        status: "Under Review", // Set initial status to Under Review
        under_review_at: now.toISOString(), // Set timestamp for initial Under Review status
      };

      console.log(
        "📋 Final report data to submit:",
        JSON.stringify(reportData, null, 2)
      );

      console.log("💾 Submitting report to database...");
      const result = await createReport(reportData);

      if (result.success) {
        console.log("🎉 Report submission successful!");

        // Reset form data
        setSelectedImages([]);
        setDescription("");

        Alert.alert("Success", "Report submitted successfully!", [
          {
            text: "OK",
            onPress: () => {
              router.push("/Dashboard/SocialLayerScreen");
            },
          },
        ]);
      } else {
        console.error("❌ Report submission failed:", result.error);
        Alert.alert("Error", `Failed to submit report: ${result.error}`);
      }
    } catch (error) {
      console.error("💥 Unexpected error in handleSubmitReport:", error);
      Alert.alert(
        "Error",
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      console.log("🔄 Resetting submission state...");
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.titleContainer}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/Reports/LocationConfirmationScreen",
                params: {
                  selectedCategory: selectedCategory,
                  categoryName: categoryName,
                },
              })
            }
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Create Report</Text>
        </View>
        <View style={styles.rightSection} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Location Summary */}
        <View style={styles.locationSummary}>
          <Text style={styles.locationSummaryText}>
            📍 {locationData.address}
          </Text>
        </View>

        {/* Category Summary */}
        <View style={styles.categorySummary}>
          <Text style={styles.categorySummaryText}>
            🏷️ Category: {categoryName}
          </Text>
        </View>

        {/* Photo Upload Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Upload Photos</Text>

          <TouchableOpacity
            style={[
              styles.uploadArea,
              selectedImages.length === 0
                ? styles.uploadAreaEmpty
                : selectedImages.length >= 2
                ? styles.uploadAreaWithImages
                : styles.uploadAreaWithFewImages,
              selectedImages.length >= 3 && { opacity: 0.5 },
            ]}
            onPress={selectedImages.length >= 3 ? undefined : pickImageSource}
            disabled={selectedImages.length >= 3}
          >
            <View style={styles.uploadIconContainer}>
              <View style={styles.cloudIconContainer}>
                {selectedImages.length >= 3 ? (
                  <Text style={styles.cloudIcon}>✅</Text>
                ) : (
                  <>
                    <Text style={styles.cloudIcon}>☁️</Text>
                    <Text style={styles.arrowIcon}>↑</Text>
                  </>
                )}
              </View>
            </View>
            <Text style={styles.browseText}>
              {selectedImages.length === 0
                ? "Browse Files"
                : selectedImages.length >= 3
                ? "Upload Complete"
                : "Add More Photos"}
            </Text>
            <Text style={styles.supportedText}>
              Supported Formats: JPEG, PNG
            </Text>
            <Text style={styles.limitText}>
              {selectedImages.length === 0
                ? "Upload Limit: 3 image files only."
                : selectedImages.length >= 3
                ? "Maximum 3 images uploaded ✓"
                : `${3 - selectedImages.length} slot${
                    3 - selectedImages.length > 1 ? "s" : ""
                  } remaining`}
            </Text>
          </TouchableOpacity>

          {selectedImages.map((image, index) => (
            <View key={index} style={styles.selectedFileContainer}>
              <View style={styles.selectedFileInfoContainer}>
                <Image source={{ uri: image.uri }} style={styles.thumbnail} />
                <View style={styles.fileNameWrapper}>
                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {image.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Describe the issue you're reporting. Include details like when it happened, what you observed, and any other relevant information..."
            placeholderTextColor="#AAAAAA"
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedImages.length === 0 ||
              !description.trim() ||
              isSubmitting) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitReport}
          disabled={
            selectedImages.length === 0 || !description.trim() || isSubmitting
          }
        >
          <Text
            style={[
              styles.submitButtonText,
              (selectedImages.length === 0 ||
                !description.trim() ||
                isSubmitting) &&
                styles.submitButtonTextDisabled,
            ]}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
