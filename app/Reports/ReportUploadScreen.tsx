import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";

SplashScreen.preventAutoHideAsync();

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
  latitude?: number;
  longitude?: number;
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
    fontSize: 20,
    color: "#000000",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  supportedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },
  limitText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
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
  continueButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});

export default function ReportUploadScreen() {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash once fonts are ready so alerts/action sheets can appear on iOS
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Request location permission on component mount
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      } else {
        Alert.alert('Location Permission', 'Location permission is required to capture GPS coordinates with photos.');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        return location;
      }
      return null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

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
        // Extract file name from uri
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

    // Get current location
    const location = await getCurrentLocation();

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
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
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

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.titleContainer}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            onPress={() => router.push("/Dashboard/SocialLayerScreen")}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>What's your concern?</Text>
        </View>
        <View style={styles.rightSection} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.uploadArea,
            selectedImages.length > 0
              ? styles.uploadAreaWithImages
              : styles.uploadAreaEmpty,
          ]}
          onPress={pickImageSource}
        >
          <View style={styles.uploadIconContainer}>
            <View style={styles.cloudIconContainer}>
              <Text style={styles.cloudIcon}>☁️</Text>
              <Text style={styles.arrowIcon}>↑</Text>
            </View>
          </View>
          <Text style={styles.browseText}>Browse Files</Text>
          <Text style={styles.supportedText}>Supported Formats: JPEG, PNG</Text>
          <Text style={styles.limitText}>
            Upload Limit: 3 image files only.
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

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={() => router.push({
            pathname: "/Reports/ReportDetailsScreen",
            params: { images: JSON.stringify(selectedImages) }
          })}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
