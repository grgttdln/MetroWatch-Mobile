import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import * as SplashScreen from "expo-splash-screen";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  uploadArea: {
    height: 400,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
  },
  uploadIconContainer: {
    marginBottom: 20,
  },
  cloudIconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloudIcon: {
    fontSize: 60,
  },
  arrowIcon: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
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
  fileName: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#333333",
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

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 3,
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
      
      // Limit to 3 images total
      const updatedImages = [...selectedImages, ...newImages].slice(0, 3);
      setSelectedImages(updatedImages);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="What's your concern?" />
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
          <View style={styles.uploadIconContainer}>
            <View style={styles.cloudIconContainer}>
              <Text style={styles.cloudIcon}>☁️</Text>
              <Text style={styles.arrowIcon}>↑</Text>
            </View>
          </View>
          <Text style={styles.browseText}>Browse Files</Text>
          <Text style={styles.supportedText}>
            Supported Formats: JPEG, PNG
          </Text>
          <Text style={styles.limitText}>
            Upload Limit: 3 image files only.
          </Text>
        </TouchableOpacity>

        {selectedImages.map((image, index) => (
          <View key={index} style={styles.selectedFileContainer}>
            <Text style={styles.fileName}>{image.name}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.deleteIcon}>X</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
