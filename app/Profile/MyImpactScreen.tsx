import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import ReportCard from "../../components/ReportCard";
import AppTabs from "../../navigation/AppTabs";
import {
  getCurrentProfile,
  getCurrentUser,
  getUserReports,
  logoutUser,
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

interface Report {
  report_id: number;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  url?: string;
  upvote: number;
  downvote: number;
  netVotes: number;
  severity: string;
  timeAgo: string;
  displayName: string;
  isCurrentUser: boolean;
  userVote: "upvote" | "downvote" | null;
  status: string;
  users: {
    name: string;
    email: string;
  };
}

export default function MyImpactScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    try {
      const currentProfile = await getCurrentProfile();
      if (currentProfile) {
        setProfile(currentProfile);
      } else {
        console.error("No user profile found");
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async () => {
    try {
      const currentUser = await getCurrentUser();
      const currentProfile = await getCurrentProfile();
      if (currentUser && currentUser.id) {
        const result = await getUserReports(currentUser.id);

        if (result.success && result.reports) {
          const transformedReports = result.reports.map((report: any) => {
            const netVotes = (report.upvote || 0) - (report.downvote || 0);

            // Calculate severity based on net votes
            let severity = "Low";
            if (netVotes >= 10) {
              severity = "Critical";
            } else if (netVotes >= 5) {
              severity = "High";
            } else if (netVotes >= 2) {
              severity = "Medium";
            }

            return {
              ...report,
              netVotes,
              severity,
              timeAgo: formatTimeAgo(report.date, report.time),
              displayName: currentProfile?.name || "You",
              isCurrentUser: true,
              userVote: null,
              status: report.status || "Open",
              users: {
                name: currentProfile?.name || "You",
                email: currentUser.email || "",
              },
            };
          });

          setUserReports(transformedReports);
        } else {
          console.error("Error fetching user reports:", result.error);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserReports:", error);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (date: string, time: string): string => {
    try {
      const reportDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - reportDateTime.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      console.error("Error formatting time ago:", error);
      return time.substring(0, 5); // Return HH:MM format as fallback
    }
  };

  // Handle upvote
  const handleUpvote = async (reportId: number) => {
    // Users can't vote on their own reports, but we'll keep this for consistency
    console.log("Cannot vote on your own report");
  };

  // Handle downvote
  const handleDownvote = async (reportId: number) => {
    // Users can't vote on their own reports, but we'll keep this for consistency
    console.log("Cannot vote on your own report");
  };

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchUserReports()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchUserData();
      await fetchUserReports();
    };
    loadData();
  }, []);

  const handleSeeIncentives = () => {
    router.push("/Incentives/IncentiveCollectionScreen");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await logoutUser();
            if (result.success) {
              // Navigate to landing page (index.tsx)
              router.replace("/");
            } else {
              Alert.alert(
                "Error",
                result.error || "Failed to logout. Please try again."
              );
            }
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Header />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
          <AppTabs />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />
        <FlatList
          data={userReports}
          keyExtractor={(item) => item.report_id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.content}>
              {/* Profile Section */}
              <View style={styles.profileContainer}>
                {/* Profile Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {profile?.name
                        ? profile.name.charAt(0).toUpperCase()
                        : "U"}
                    </Text>
                  </View>
                </View>

                {/* User Name */}
                <Text style={styles.username}>
                  {profile?.name || "Username"}
                </Text>

                {/* Location */}
                <View style={styles.locationContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.location}>{profile?.city || "City"}</Text>
                </View>

                {/* Points */}
                <Text style={styles.pointsText}>
                  {profile?.points || 0} Points
                </Text>

                {/* See my Incentives Button */}
                <TouchableOpacity
                  style={styles.incentivesButton}
                  onPress={handleSeeIncentives}
                >
                  <Text style={styles.incentivesButtonText}>
                    See my Incentives
                  </Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>

              {/* Your Reports Section */}
              <View style={styles.reportsContainer}>
                <Text style={styles.reportsTitle}>
                  Your Reports ({userReports.length})
                </Text>
                {userReports.length === 0 && (
                  <Text style={styles.noReportsText}>
                    No reports yet. Start making a difference in your community!
                  </Text>
                )}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.reportWrapper}>
              <ReportCard
                item={item}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                showVoting={true}
                readOnly={true} // Show vote counts but disable voting for user's own reports
              />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#C4C4C4",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  location: {
    fontSize: 16,
    color: "#666666",
  },
  pointsText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 24,
  },
  incentivesButton: {
    backgroundColor: "#002697",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  incentivesButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  reportsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  reportsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  noReportsText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 20,
  },
  reportWrapper: {
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  titleWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E",
    textAlign: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
