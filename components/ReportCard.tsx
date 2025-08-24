import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

interface ReportCardProps {
  item: Report;
  onUpvote?: (reportId: number) => void;
  onDownvote?: (reportId: number) => void;
  showVoting?: boolean; // Option to show/hide voting buttons
  readOnly?: boolean; // Option to show vote counts but disable voting
}

const severityColors: { [key: string]: string } = {
  Low: "#4CAF50",
  Medium: "#FF9800",
  High: "#FF5722",
  Critical: "#F44336",
};

export default function ReportCard({
  item,
  onUpvote,
  onDownvote,
  showVoting = true,
  readOnly = false,
}: ReportCardProps) {
  return (
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
          <Text
            style={[
              styles.userName,
              item.isCurrentUser && styles.currentUserName,
            ]}
          >
            {item.displayName}
          </Text>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        </View>
      </View>

      {item.url && (
        <View style={styles.imagesContainer}>
          {(() => {
            const imageUrls = item.url
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

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.tagsContainer}>
        <View
          style={[
            styles.severityTag,
            { backgroundColor: severityColors[item.severity] },
          ]}
        >
          <Text style={styles.severityTagText}>{item.severity}</Text>
        </View>
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor:
                item.status === "Resolved" ? "#4CAF50" : "#FF9800",
            },
          ]}
        >
          <Text style={styles.statusTagText}>{item.status}</Text>
        </View>
      </View>

      {showVoting && (
        <View style={styles.actionsContainer}>
          <View style={styles.voteButtonsContainer}>
            {readOnly ? (
              // Read-only view - display as simple info without button styling
              <>
                <View style={styles.voteInfo}>
                  <MaterialIcons name="thumb-up" size={18} color="#4CAF50" />
                  <Text style={styles.voteInfoText}>{item.upvote || 0}</Text>
                </View>

                <View style={styles.voteInfo}>
                  <MaterialIcons name="thumb-down" size={18} color="#F44336" />
                  <Text style={styles.voteInfoText}>{item.downvote || 0}</Text>
                </View>
              </>
            ) : (
              // Interactive buttons for voting
              <>
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    item.userVote === "upvote" && styles.activeUpvoteButton,
                  ]}
                  onPress={() => onUpvote?.(item.report_id)}
                >
                  <MaterialIcons
                    name="thumb-up"
                    size={18}
                    color={item.userVote === "upvote" ? "#fff" : "#4CAF50"}
                  />
                  <Text
                    style={[
                      styles.voteButtonText,
                      item.userVote === "upvote" && styles.activeVoteButtonText,
                    ]}
                  >
                    {item.upvote || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    item.userVote === "downvote" && styles.activeDownvoteButton,
                  ]}
                  onPress={() => onDownvote?.(item.report_id)}
                >
                  <MaterialIcons
                    name="thumb-down"
                    size={18}
                    color={item.userVote === "downvote" ? "#fff" : "#F44336"}
                  />
                  <Text
                    style={[
                      styles.voteButtonText,
                      item.userVote === "downvote" &&
                        styles.activeVoteButtonText,
                    ]}
                  >
                    {item.downvote || 0}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  imagesContainer: {
    marginBottom: 16,
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
  voteInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
