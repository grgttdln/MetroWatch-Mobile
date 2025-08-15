import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import AppTabs from "../../navigation/AppTabs";
import { getCurrentUser, fetchUserById } from "../../services/supabase";

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

export default function MyImpactScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSeeIncentives = () => {
    router.push('/Incentives/IncentiveCollectionScreen');
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
              <Text style={styles.location}>{user?.city || 'City'}, {user?.city || 'City'}</Text>
            </View>

            {/* Points */}
            <Text style={styles.pointsText}>{user?.points || 0} Points</Text>

            {/* See my Incentives Button */}
            <TouchableOpacity style={styles.incentivesButton} onPress={handleSeeIncentives}>
              <Text style={styles.incentivesButtonText}>See my Incentives</Text>
            </TouchableOpacity>
          </View>

          {/* Your Reports Section */}
          <View style={styles.reportsContainer}>
            <Text style={styles.reportsTitle}>Your Reports</Text>
            {/* You can add report items here in the future */}
          </View>
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
    marginBottom: 40,
  },
  incentivesButtonText: {
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