import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

// SVG Icon Components
const SocialIcon = ({ color = "#FFFFFF", size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
    <Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h240v-560H200v560Zm320 0h240v-280H520v280Zm0-360h240v-200H520v200Z" />
  </Svg>
);

const ReportIcon = ({ color = "#FFFFFF", size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
    <Path d="M440-520h80v-200h-80v200Zm40 160q17 0 28.5-11.5T520-400q0-17-11.5-28.5T480-440q-17 0-28.5 11.5T440-400q0 17 11.5 28.5T480-360Zm0 174q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
  </Svg>
);

const ProfileIcon = ({ color = "#FFFFFF", size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
    <Path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54 54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
  </Svg>
);

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
          <SocialIcon
            color={isActive("Dashboard") ? "#FFFFFF" : "#FFFFFF"}
            size={36}
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
            <ReportIcon color="#002697" size={50} />
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
          <ProfileIcon
            color={isActive("Profile") ? "#FFFFFF" : "#FFFFFF"}
            size={36}
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
});

export default AppTabs;
