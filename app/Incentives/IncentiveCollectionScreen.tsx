import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import IncentiveItem from "../../components/IncentiveItem";
import AppTabs from "../../navigation/AppTabs";
import { getCurrentProfile, updateUserPoints } from "../../services/supabase";

interface Profile {
  id: string;
  name: string;
  mobile: string;
  city: string;
  points: number;
  created_at: string;
  updated_at: string;
}

interface Incentive {
  id: string;
  title: string;
  pointsRequired: number;
  image?: any;
}

export default function IncentiveCollectionScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const incentives: Incentive[] = [
    {
      id: "1",
      title: "1 year supply of Rice",
      pointsRequired: 34,
      image: require("../../assets/images/incentives/rice.jpg"),
    },
    {
      id: "2",
      title: "1-pc Chickenjoy",
      pointsRequired: 75,
      image: require("../../assets/images/incentives/chickenjoy.jpg"),
    },
  ];

  const fetchUserData = async () => {
    try {
      const currentProfile = await getCurrentProfile();
      console.log("Current profile:", currentProfile);

      if (currentProfile) {
        console.log("Profile data:", currentProfile);
        setProfile(currentProfile);
      } else {
        console.log("No current profile found");
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleBackPress = () => {
    router.push("/Profile/MyImpactScreen");
  };

  const handleRedeem = async (incentive: Incentive) => {
    if (!profile) return;

    if (profile.points >= incentive.pointsRequired) {
      Alert.alert(
        "Redeem Incentive",
        `Are you sure you want to redeem ${incentive.title} for ${incentive.pointsRequired} points?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Redeem",
            onPress: async () => {
              try {
                console.log(
                  "Starting redemption for profile:",
                  profile.id,
                  "Current points:",
                  profile.points,
                  "Required:",
                  incentive.pointsRequired
                );
                const newPoints = profile.points - incentive.pointsRequired;
                console.log("Calculated new points:", newPoints);

                const result = await updateUserPoints(profile.id, newPoints);

                if (result.success) {
                  console.log(
                    "Points updated successfully, navigating to claim screen"
                  );
                  setProfile(result.profile);

                  router.push({
                    pathname: "/Incentives/IncentiveClaimScreen",
                    params: {
                      incentiveName: incentive.title,
                      incentivePoints: incentive.pointsRequired.toString(),
                    },
                  });
                } else {
                  console.error("Failed to update points:", result.error);
                  if (
                    result.error.includes("database security policies") ||
                    result.error.includes("RLS")
                  ) {
                    Alert.alert(
                      "Database Configuration Issue",
                      "There's a configuration issue with the database. Please contact support or check the database settings.",
                      [{ text: "OK" }]
                    );
                  } else {
                    Alert.alert(
                      "Error",
                      `Failed to redeem incentive: ${result.error}`
                    );
                  }
                }
              } catch (error) {
                console.error("Error redeeming incentive:", error);
                Alert.alert(
                  "Error",
                  "Failed to redeem incentive. Please try again."
                );
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Insufficient Points",
        `You need ${
          incentive.pointsRequired - profile.points
        } more points to redeem this incentive.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.title}>Your Incentives</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.pointsBadgeContainer}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {loading
                  ? "Loading..."
                  : `${profile?.points || 0} Total Points`}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
              </View>
            ) : (
              incentives.map((incentive) => (
                <IncentiveItem
                  key={incentive.id}
                  title={incentive.title}
                  pointsRequired={incentive.pointsRequired}
                  userPoints={profile?.points || 0}
                  image={incentive.image}
                  onRedeem={() => handleRedeem(incentive)}
                />
              ))
            )}
          </ScrollView>
        </View>
        <AppTabs />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 40, // Same width as back button to center the title
  },
  pointsBadgeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  pointsBadge: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  titleWrapper: {
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
  },
});
