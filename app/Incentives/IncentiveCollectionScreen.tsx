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
import {
  getCurrentProfile,
  getIncentives,
  updateUserPoints,
} from "../../services/supabase";

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
  incentive_id: string;
  item: string;
  points: number;
  business: string;
  url?: string;
}

export default function IncentiveCollectionScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch user profile and incentives in parallel
      const [profileResult, incentivesResult] = await Promise.all([
        getCurrentProfile(),
        getIncentives(),
      ]);

      console.log("Current profile:", profileResult);
      console.log("Incentives result:", incentivesResult);

      if (profileResult) {
        console.log("Profile data:", profileResult);
        setProfile(profileResult);
      } else {
        console.log("No current profile found");
      }

      if (incentivesResult.success && incentivesResult.incentives) {
        console.log("Incentives data:", incentivesResult.incentives);
        setIncentives(incentivesResult.incentives);
      } else {
        console.error("Error fetching incentives:", incentivesResult.error);
        setIncentives([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBackPress = () => {
    router.push("/Profile/MyImpactScreen");
  };

  const handleRedeem = async (incentive: Incentive) => {
    if (!profile) return;

    if (profile.points >= incentive.points) {
      Alert.alert(
        "Redeem Incentive",
        `Are you sure you want to redeem ${incentive.item} for ${incentive.points} points?`,
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
                  incentive.points
                );
                const newPoints = profile.points - incentive.points;
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
                      incentiveName: incentive.item,
                      incentivePoints: incentive.points.toString(),
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
          incentive.points - profile.points
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
              </View>
            ) : incentives.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No incentives available at the moment
                </Text>
              </View>
            ) : (
              incentives.map((incentive) => (
                <IncentiveItem
                  key={incentive.incentive_id}
                  title={incentive.item}
                  business={incentive.business}
                  pointsRequired={incentive.points}
                  userPoints={profile?.points || 0}
                  image={incentive.url ? { uri: incentive.url } : null}
                  onRedeem={() => handleRedeem(incentive)}
                />
              ))
            )}
          </ScrollView>
        </View>
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
    paddingTop: 5,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
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
    width: 40,
  },
  pointsBadgeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  pointsBadge: {
    backgroundColor: "#002697",
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
});
