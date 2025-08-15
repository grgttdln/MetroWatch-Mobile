import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../../components/Header";
import AppTabs from "../../navigation/AppTabs";
import { downvoteReport, getCommunityReports, getCurrentUser, upvoteReport } from "../../services/supabase";

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

const severityColors: { [key: string]: string } = {
  Low: "#4CAF50",
  Medium: "#FF9800", 
  High: "#FF5722",
  Critical: "#F44336"
};

export default function SocialLayerScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const result = await getCommunityReports();
      
      if (result.success) {
        setReports(result.reports || []);
      } else {
        Alert.alert("Error", "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Failed to fetch reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const handleUpvote = async (reportId: number) => {
    try {
      const result = await upvoteReport(reportId);
      if (result.success) {
        // Refresh the reports to show updated vote count
        fetchReports();
      } else {
        Alert.alert("Cannot Vote", result.error || "Failed to upvote report");
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      Alert.alert("Error", "Failed to upvote report");
    }
  };

  const handleDownvote = async (reportId: number) => {
    try {
      const result = await downvoteReport(reportId);
      if (result.success) {
        // Refresh the reports to show updated vote count
        fetchReports();
      } else {
        Alert.alert("Cannot Vote", result.error || "Failed to downvote report");
      }
    } catch (error) {
      console.error("Error downvoting:", error);
      Alert.alert("Error", "Failed to downvote report");
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{item.category}</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={[
            styles.userName, 
            item.isCurrentUser && styles.currentUserName
          ]}>
            {item.displayName}
          </Text>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        </View>
      </View>

      {item.url && (
        <Image 
          source={{ uri: item.url }} 
          style={styles.reportImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.tagsContainer}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>
            {item.category}
          </Text>
        </View>
        <View style={[styles.severityTag, { backgroundColor: severityColors[item.severity] }]}>
          <Text style={styles.severityTagText}>
            {item.severity}
          </Text>
        </View>
        <View style={[
          styles.statusTag, 
          { backgroundColor: item.status === 'Resolved' ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.statusTagText}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.voteButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.voteButton,
              item.userVote === 'upvote' && styles.activeUpvoteButton
            ]}
            onPress={() => handleUpvote(item.report_id)}
          >
            <MaterialIcons 
              name="thumb-up" 
              size={18} 
              color={item.userVote === 'upvote' ? "#fff" : "#4CAF50"} 
            />
            <Text style={[
              styles.voteButtonText,
              item.userVote === 'upvote' && styles.activeVoteButtonText
            ]}>
              {item.upvote || 0}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.voteButton,
              item.userVote === 'downvote' && styles.activeDownvoteButton
            ]}
            onPress={() => handleDownvote(item.report_id)}
          >
            <MaterialIcons 
              name="thumb-down" 
              size={18} 
              color={item.userVote === 'downvote' ? "#fff" : "#F44336"} 
            />
            <Text style={[
              styles.voteButtonText,
              item.userVote === 'downvote' && styles.activeVoteButtonText
            ]}>
              {item.downvote || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />
        
        <View style={styles.content}>
          <Text style={styles.title}>Community Feed</Text>
          
          {/* Reports List */}
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.report_id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
        
        <AppTabs />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 100, // Add extra padding to prevent navbar covering
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F2F5",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  userInfo: {
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  currentUserName: {
    color: "#1976D2",
    fontWeight: "700",
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  reportImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
  },
  description: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976D2",
  },
  severityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  voteButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    gap: 6,
  },
  activeUpvoteButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  activeDownvoteButton: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeVoteButtonText: {
    color: "#fff",
  },
});
