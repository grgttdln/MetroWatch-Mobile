import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import AppTabs from "../../navigation/AppTabs";
import IncentiveItem from "../../components/IncentiveItem";
import { getCurrentUser, fetchUserById, updateUserPoints } from "../../services/supabase";

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

interface Incentive {
  id: string;
  title: string;
  pointsRequired: number;
  image?: any; // Changed from string to any to handle require() imports
}

export default function IncentiveCollectionScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sample incentives data - you can later move this to a database
  const incentives: Incentive[] = [
    {
      id: '1',
      title: '1 year supply of Rice',
      pointsRequired: 34,
      image: require('../../assets/images/incentives/rice.jpg'),
    },
    {
      id: '2',
      title: '1-pc Chickenjoy',
      pointsRequired: 75,
      image: require('../../assets/images/incentives/chickenjoy.jpg'),
    },
    // Add more incentives as needed
  ];

  // Function to fetch fresh user data from database
  const fetchUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('Current user from storage:', currentUser);
      
      if (currentUser && currentUser.id) {
        console.log('Fetching fresh user data for ID:', currentUser.id);
        const result = await fetchUserById(currentUser.id);
        
        if (result.success) {
          console.log('Fresh user data:', result.user);
          setUser(result.user);
        } else {
          console.error('Error fetching user data:', result.error);
        }
      } else {
        console.log('No current user found');
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

  const handleBackPress = () => {
    router.push('/Profile/MyImpactScreen');
  };

  const handleRedeem = async (incentive: Incentive) => {
    if (!user) return;

    if (user.points >= incentive.pointsRequired) {
      Alert.alert(
        "Redeem Incentive",
        `Are you sure you want to redeem ${incentive.title} for ${incentive.pointsRequired} points?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Redeem",
            onPress: async () => {
              try {
                console.log('Starting redemption for user:', user.id, 'Current points:', user.points, 'Required:', incentive.pointsRequired);
                const newPoints = user.points - incentive.pointsRequired;
                console.log('Calculated new points:', newPoints);
                
                const result = await updateUserPoints(user.id, newPoints);
                
                if (result.success) {
                  console.log('Points updated successfully, navigating to claim screen');
                  setUser(result.user);
                  // Navigate to claim screen with incentive details
                  router.push({
                    pathname: '/Incentives/IncentiveClaimScreen',
                    params: {
                      incentiveName: incentive.title,
                      incentivePoints: incentive.pointsRequired.toString()
                    }
                  });
                } else {
                  console.error('Failed to update points:', result.error);
                  if (result.error.includes('database security policies') || result.error.includes('RLS')) {
                    Alert.alert(
                      "Database Configuration Issue", 
                      "There's a configuration issue with the database. Please contact support or check the database settings.",
                      [{ text: "OK" }]
                    );
                  } else {
                    Alert.alert("Error", `Failed to redeem incentive: ${result.error}`);
                  }
                }
              } catch (error) {
                console.error('Error redeeming incentive:', error);
                Alert.alert("Error", "Failed to redeem incentive. Please try again.");
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Insufficient Points",
        `You need ${incentive.pointsRequired - user.points} more points to redeem this incentive.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          {/* Header with back button and title */}
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.title}>Your Incentives</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Total Points Badge */}
          <View style={styles.pointsBadgeContainer}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {loading ? "Loading..." : `${user?.points || 0} Total Points`}
              </Text>
            </View>
          </View>

          {/* Incentives List */}
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
                  userPoints={user?.points || 0}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
