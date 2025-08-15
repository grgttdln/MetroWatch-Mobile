import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import ReportCard from "../../components/ReportCard";
import AppTabs from "../../navigation/AppTabs";
import { fetchUserById, getCurrentUser, getUserReports, upvoteReport, downvoteReport, clearCurrentUser } from "../../services/supabase";

interface User {
  id: number;
  name: string;
  email: string;
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
  userVote: 'upvote' | 'downvote' | null;
  status: string;
  users: {
    name: string;
    email: string;
  };
}

export default function MyImpactScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch fresh user data from database
  const fetchUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id) {
        const result = await fetchUserById(currentUser.id);
        
        if (result.success) {
          setUser(result.user);
        } else {
          console.error('Error fetching user data:', result.error);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user's reports
  const fetchUserReports = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id) {
        const result = await getUserReports(currentUser.id);
        
        if (result.success && result.reports) {
          // Transform reports to match the Report interface
          const transformedReports = result.reports.map((report: any) => ({
            ...report,
            netVotes: (report.upvote || 0) - (report.downvote || 0),
            timeAgo: getTimeAgo(report.created_at),
            displayName: currentUser.name || 'You',
            isCurrentUser: true,
            userVote: null, // Since these are user's own reports, they can't vote
            status: report.status || 'Open',
            users: {
              name: currentUser.name || 'You',
              email: currentUser.email || ''
            }
          }));
          
          setUserReports(transformedReports);
        } else {
          console.error('Error fetching user reports:', result.error);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserReports:', error);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  // Handle upvote
  const handleUpvote = async (reportId: number) => {
    // Users can't vote on their own reports, but we'll keep this for consistency
    console.log('Cannot vote on your own report');
  };

  // Handle downvote  
  const handleDownvote = async (reportId: number) => {
    // Users can't vote on their own reports, but we'll keep this for consistency
    console.log('Cannot vote on your own report');
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
    router.push('/Incentives/IncentiveCollectionScreen');
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await clearCurrentUser();
              // Navigate to landing page (index.tsx)
              router.replace('/');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
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
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                </View>

                {/* User Name */}
                <Text style={styles.username}>{user?.name || 'Username'}</Text>

                {/* Location */}
                <View style={styles.locationContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.location}>{user?.city || 'City'}</Text>
                </View>

                {/* Points */}
                <Text style={styles.pointsText}>{user?.points || 0} Points</Text>

                {/* See my Incentives Button */}
                <TouchableOpacity style={styles.incentivesButton} onPress={handleSeeIncentives}>
                  <Text style={styles.incentivesButtonText}>See my Incentives</Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>

              {/* Your Reports Section */}
              <View style={styles.reportsContainer}>
                <Text style={styles.reportsTitle}>Your Reports ({userReports.length})</Text>
                {userReports.length === 0 && (
                  <Text style={styles.noReportsText}>No reports yet. Start making a difference in your community!</Text>
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
                showVoting={false} // Don't show voting for user's own reports
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
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  location: {
    fontSize: 16,
    color: '#666666',
  },
  pointsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
  },
  incentivesButton: {
    backgroundColor: '#666666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  incentivesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  reportsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  reportsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  noReportsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
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