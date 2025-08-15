import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

const AppTabs = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToScreen = (screenPath, routeName) => {
    // Prevent navigation if already on the same screen
    if (isActive(routeName)) {
      return;
    }

    // Use replace with fade animation
    router.replace(screenPath);
  };

  const isActive = (screenPath) => {
    return pathname.includes(screenPath);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        {/* Social Layer Icon - Left */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isActive("Dashboard") && styles.activeButton,
            isActive("Dashboard") && styles.disabledButton,
          ]}
          onPress={() =>
            navigateToScreen("/Dashboard/SocialLayerScreen", "Dashboard")
          }
          disabled={isActive("Dashboard")}
          activeOpacity={isActive("Dashboard") ? 1 : 0.7}
        >
          <Image
            source={require("../assets/images/icons/social.png")}
            style={[styles.icon, isActive("Dashboard") && styles.activeIcon]}
          />
        </TouchableOpacity>

        {/* Elevated Report Icon - Center */}
        <View style={styles.centerButtonContainer}>
          <TouchableOpacity
            style={[
              styles.elevatedButton,
              isActive("Reports") && styles.activeElevatedButton,
              isActive("Reports") && styles.disabledElevatedButton,
            ]}
            onPress={() =>
              navigateToScreen("/Reports/ReportUploadScreen", "Reports")
            }
            disabled={isActive("Reports")}
            activeOpacity={isActive("Reports") ? 1 : 0.7}
          >
            <Image
              source={require("../assets/images/icons/report.png")}
              style={styles.reportIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Icon - Right */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isActive("Profile") && styles.activeButton,
            isActive("Profile") && styles.disabledButton,
          ]}
          onPress={() => navigateToScreen("/Profile/MyImpactScreen", "Profile")}
          disabled={isActive("Profile")}
          activeOpacity={isActive("Profile") ? 1 : 0.7}
        >
          <Image
            source={require("../assets/images/icons/profile.png")}
            style={[styles.icon, isActive("Profile") && styles.activeIcon]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: "#002697", // Your specified blue color
    borderRadius: 30, // Slightly reduced for more compact look
    paddingVertical: 12, // Reduced from 18
    paddingHorizontal: 25, // Reduced from 35 to bring icons closer
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minHeight: 56, // Reduced from 70
  },
  iconButton: {
    padding: 10, // Reduced from 15
    borderRadius: 20, // Reduced from 25
    minWidth: 44, // Reduced from 50
    minHeight: 44, // Reduced from 50
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  disabledButton: {
    opacity: 0.8,
  },
  icon: {
    width: 36,
    height: 36,
    tintColor: "#FFFFFF",
  },
  activeIcon: {
    tintColor: "#FFFFFF",
  },
  centerButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  elevatedButton: {
    width: 90, // Made bigger to match the image
    height: 90, // Made bigger to match the image
    backgroundColor: "#FFFFFF",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50, // More elevation to peak above
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: "#002697", // Your specified blue color
    overflow: "hidden",
  },
  activeElevatedButton: {
    backgroundColor: "#F0F8FF",
  },
  disabledElevatedButton: {
    opacity: 0.8,
  },
  reportIcon: {
    width: "100%",
    height: "100%",
  },
});

export default AppTabs;
