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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";

SplashScreen.preventAutoHideAsync();

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: "uncollected-garbage", name: "Uncollected Garbage", icon: "🗑️" },
  {
    id: "damaged-drainage",
    name: "Damaged or Open Drainage/Canals",
    icon: "🕳️",
  },
  {
    id: "damaged-sidewalks",
    name: "Damaged or Obstructed Sidewalks",
    icon: "🚶",
  },
  { id: "broken-streetlights", name: "Broken Street Lights", icon: "💡" },
  { id: "blocked-bike-lanes", name: "Blocked Bike Lanes", icon: "🚴" },
  { id: "bark-street", name: "Bark Street", icon: "🐕" },
  { id: "dangling-wires", name: "Dangling Electrical Wires", icon: "⚡" },
  { id: "public-transport", name: "Public Transport", icon: "🚌" },
  { id: "others", name: "Others", icon: "📋" },
];

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
    marginBottom: 24,
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
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  categoriesGrid: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItemSelected: {
    backgroundColor: "#F8F9FF",
    borderColor: "#1A237E",
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 28,
    marginRight: 16,
    width: 40,
    textAlign: "center",
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#2C2C2C",
    lineHeight: 24,
  },
  categoryNameSelected: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#1A237E",
    lineHeight: 24,
  },
  checkIcon: {
    fontSize: 20,
    color: "#1A237E",
    marginLeft: 12,
  },
  continueButton: {
    backgroundColor: "#1A237E",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
});

export default function ReportCategoryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleContinue = () => {
    if (selectedCategory) {
      const category = categories.find((cat) => cat.id === selectedCategory);
      router.push({
        pathname: "/Reports/ReportUploadScreen",
        params: {
          selectedCategory: selectedCategory,
          categoryName: category?.name || "",
        },
      });
    }
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
          <Text style={styles.title}>Report a Concern</Text>
        </View>
        <View style={styles.rightSection} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          What type of concern would you like to report?
        </Text>

        <ScrollView
          style={styles.categoriesGrid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  isSelected && styles.categoryItemSelected,
                ]}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryTextContainer}>
                  <Text
                    style={[
                      styles.categoryName,
                      isSelected && styles.categoryNameSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </View>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedCategory && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedCategory}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedCategory && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
