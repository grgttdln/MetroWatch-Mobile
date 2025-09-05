import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import {
  getReportById,
  updateReportConfirmation,
} from "../../services/supabase";

interface StatusUpdate {
  status: string;
  timestamp: string;
  message: string;
  description?: string;
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
  status: string;
  remarks?: string;
  confirmed?: boolean;
  under_review_at?: string;
  processing_updated_at?: string;
  pending_confirmation_updated_at?: string;
  resolved_updated_at?: string;
  confirmed_updated_at?: string;
  created_at?: string;
}

const statusConfig: Record<
  string,
  { color: string; icon: string; message: string; description?: string }
> = {
  "Under Review": {
    color: "#2196F3",
    icon: "visibility",
    message: "We're reviewing your report. Thanks for your patience.",
  },
  Processing: {
    color: "#FF9800",
    icon: "build",
    message: "Our team is already working on the issue.",
  },
  "Pending Confirmation": {
    color: "#FF5722",
    icon: "help",
    message: "Please confirm if the issue has been resolved.",
  },
  Resolved: {
    color: "#4CAF50",
    icon: "check-circle",
    message: "The issue has been fixed. Thanks for your help!",
  },
};

const statusOrder = [
  "Under Review",
  "Processing",
  "Pending Confirmation",
  "Resolved",
];

export default function ReportDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const reportId = parseInt(params.reportId as string);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    try {
      const result = await getReportById(reportId);
      if (result.success) {
        setReport(result.report);
      } else {
        Alert.alert("Error", "Failed to load report details");
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
      Alert.alert("Error", "Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = () => {
    Alert.alert(
      "Confirm Resolution",
      "Has this issue been resolved to your satisfaction?",
      [
        {
          text: "No, Still an Issue",
          style: "cancel",
          onPress: () => updateConfirmation(false),
        },
        {
          text: "Yes, It's Resolved",
          onPress: () => updateConfirmation(true),
        },
      ]
    );
  };

  const updateConfirmation = async (confirmed: boolean) => {
    setUpdating(true);
    try {
      const result = await updateReportConfirmation(reportId, confirmed);
      if (result.success) {
        setReport({
          ...report!,
          confirmed: confirmed,
        });
        Alert.alert(
          "Success",
          confirmed
            ? "Thank you for confirming the resolution!"
            : "We've noted that the issue still needs attention."
        );
      } else {
        Alert.alert("Error", "Failed to update report confirmation");
      }
    } catch (error) {
      console.error("Error updating confirmation:", error);
      Alert.alert("Error", "Failed to update report confirmation");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats
      const date = dateString.includes("T")
        ? new Date(dateString)
        : new Date(dateString + "T00:00:00");

      if (isNaN(date.getTime())) {
        return dateString; // Return original string if parsing fails
      }

      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // If it's a full datetime string
      if (timeString.includes("T")) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
        }
      }

      // If it's just a time string (HH:MM:SS or HH:MM)
      const timeParts = timeString.split(":");
      if (timeParts.length >= 2) {
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);

        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
      }

      return timeString; // Return original if can't parse
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  const getCurrentStatusIndex = () => {
    return statusOrder.indexOf(report?.status || "Under Review");
  };

  const generateStatusTimeline = () => {
    const timeline: StatusUpdate[] = [];

    if (!report) return timeline;

    // Map status to their corresponding timestamp fields
    const statusTimestamps = {
      "Under Review":
        report.under_review_at ||
        report.created_at ||
        `${report.date}T${report.time}`,
      Processing: report.processing_updated_at,
      "Pending Confirmation": report.pending_confirmation_updated_at,
      Resolved: report.resolved_updated_at,
    };

    // Only show statuses that have actual timestamps (or are the initial status)
    statusOrder.forEach((status) => {
      const timestamp =
        statusTimestamps[status as keyof typeof statusTimestamps];

      // Always show "Under Review" as it's the initial status
      // Show other statuses only if they have timestamps
      if (status === "Under Review" || timestamp) {
        const config = statusConfig[status as keyof typeof statusConfig];

        // For Pending Confirmation, use remarks from database if available
        let description = config.description;
        if (status === "Pending Confirmation" && report.remarks) {
          description = report.remarks;
        }

        timeline.push({
          status,
          timestamp: timestamp || new Date().toISOString(),
          message: config.message,
          description,
        });
      }
    });

    return timeline.reverse(); // Show newest first
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A237E" />
          <Text style={styles.loadingText}>Loading report details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Report not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const timeline = generateStatusTimeline();
  const currentStatusConfig =
    statusConfig[report.status as keyof typeof statusConfig];

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Detail</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Report Info */}
        <View style={styles.reportInfoContainer}>
          <Text style={styles.reportCategory}>{report.category}</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.locationText}>{report.location}</Text>
          </View>

          {/* Report Images */}
          {report.url && (
            <View style={styles.imagesContainer}>
              {(() => {
                const imageUrls = report.url
                  .split(",")
                  .filter((url) => url.trim() !== "");

                if (imageUrls.length === 1) {
                  return (
                    <Image
                      source={{ uri: imageUrls[0].trim() }}
                      style={styles.singleImage}
                      resizeMode="cover"
                    />
                  );
                } else if (imageUrls.length === 2) {
                  return (
                    <View style={styles.twoImagesContainer}>
                      {imageUrls.map((url, index) => (
                        <Image
                          key={index}
                          source={{ uri: url.trim() }}
                          style={styles.doubleImage}
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  );
                } else if (imageUrls.length === 3) {
                  return (
                    <View style={styles.threeImagesContainer}>
                      <Image
                        source={{ uri: imageUrls[0].trim() }}
                        style={styles.primaryImage}
                        resizeMode="cover"
                      />
                      <View style={styles.secondaryImagesContainer}>
                        <Image
                          source={{ uri: imageUrls[1].trim() }}
                          style={styles.secondaryImage}
                          resizeMode="cover"
                        />
                        <Image
                          source={{ uri: imageUrls[2].trim() }}
                          style={styles.secondaryImage}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  );
                }
                return null;
              })()}
            </View>
          )}

          <Text style={styles.reportDescription}>{report.description}</Text>

          <View style={styles.reportMetaContainer}>
            <Text style={styles.reportMeta}>
              Reported on {formatDate(report.date)} at {formatTime(report.time)}
            </Text>
            <Text style={styles.reportMeta}>
              Report ID: #{report.report_id}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Status Updates</Text>

          {timeline.map((update, index) => {
            const config =
              statusConfig[update.status as keyof typeof statusConfig];
            const isLatest = index === 0;

            return (
              <View key={update.status} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <Text style={styles.timelineDate}>
                    {formatDate(update.timestamp)}
                  </Text>
                  <Text style={styles.timelineTime}>
                    {formatTime(update.timestamp)}
                  </Text>
                </View>

                <View style={styles.timelineCenter}>
                  <View
                    style={[
                      styles.timelineIcon,
                      { backgroundColor: config.color },
                      isLatest && styles.timelineIconLatest,
                    ]}
                  >
                    <MaterialIcons
                      name={config.icon as any}
                      size={16}
                      color="white"
                    />
                  </View>
                  {index < timeline.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                <View style={styles.timelineRight}>
                  <View
                    style={[
                      styles.statusContainer,
                      { backgroundColor: isLatest ? config.color : "#F5F5F5" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: isLatest ? "white" : config.color },
                      ]}
                    >
                      {update.status}
                    </Text>
                    <Text
                      style={[
                        styles.statusMessage,
                        { color: isLatest ? "white" : "#666" },
                      ]}
                    >
                      {update.message}
                    </Text>
                    {update.description && (
                      <View style={styles.remarksContainer}>
                        <Text
                          style={[
                            styles.remarksTitle,
                            { color: isLatest ? "white" : "#333" },
                          ]}
                        >
                          REMARKS
                        </Text>
                        <Text
                          style={[
                            styles.remarksText,
                            { color: isLatest ? "white" : "#666" },
                          ]}
                        >
                          {update.description}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Confirmation Button for Pending Confirmation status */}
        {report.status === "Pending Confirmation" && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (updating || report.confirmed) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmResolution}
              disabled={updating || report.confirmed}
            >
              <Text style={styles.confirmButtonText}>
                {updating
                  ? "Updating..."
                  : report.confirmed
                  ? "Already Confirmed"
                  : "Confirm Resolution"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#1A237E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reportInfoContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  reportCategory: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  reportDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  reportMetaContainer: {
    gap: 4,
  },
  reportMeta: {
    fontSize: 13,
    color: "#888",
  },
  imagesContainer: {
    marginVertical: 16,
  },
  singleImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  twoImagesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  doubleImage: {
    flex: 1,
    height: 180,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  threeImagesContainer: {
    flexDirection: "row",
    gap: 8,
    height: 180,
  },
  primaryImage: {
    flex: 2,
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  secondaryImagesContainer: {
    flex: 1,
    gap: 8,
  },
  secondaryImage: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  timelineContainer: {
    paddingVertical: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    width: 60,
    alignItems: "flex-end",
    paddingRight: 16,
    paddingTop: 8,
  },
  timelineDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  timelineTime: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  timelineCenter: {
    alignItems: "center",
    position: "relative",
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  timelineIconLatest: {
    transform: [{ scale: 1.1 }],
  },
  timelineLine: {
    position: "absolute",
    top: 32,
    width: 2,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 16,
  },
  statusContainer: {
    borderRadius: 12,
    padding: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  remarksContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
  },
  remarksTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  remarksText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
