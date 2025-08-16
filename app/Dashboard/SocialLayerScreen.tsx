import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Header from "../../components/Header";
import ReportCard from "../../components/ReportCard";
import AppTabs from "../../navigation/AppTabs";
import {
  downvoteReport,
  getCommunityReports,
  getCurrentUser,
  upvoteReport,
} from "../../services/supabase";

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
    <ReportCard
      item={item}
      onUpvote={handleUpvote}
      onDownvote={handleDownvote}
      showVoting={true}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>
          <Text style={styles.title}>Community Feed</Text>

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
    paddingBottom: 100,
  },
});
