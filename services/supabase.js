import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Current user state
let currentUser = null;
let currentProfile = null;

// Initialize current user from Supabase auth session (call on app start)
export const initializeCurrentUser = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    if (session?.user) {
      currentUser = session.user;
      // Also fetch the user profile
      const profileResult = await getUserProfile(session.user.id);
      if (profileResult.success) {
        currentProfile = profileResult.profile;
      }
      console.log("App initialized with user:", currentUser.email);
      return { user: currentUser, profile: currentProfile };
    }
  } catch (error) {
    console.error("Error initializing current user:", error);
  }
  console.log("App initialized without user session");
  return null;
};

// Get user profile from profiles table
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return { success: false, error: error.message };
  }
};

// Create or update user profile using upsert (handles both create and update)
export const upsertUserProfile = async (userId, name, mobile, city) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          name: name,
          mobile: mobile,
          city: city,
          points: 0, // Initialize with 0 points for new profiles
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id", // Update if ID already exists
        }
      )
      .select();

    if (error) {
      console.error("Profile upsert error:", error);
      return { success: false, error: error.message };
    }

    console.log("Profile upserted successfully:", data[0]);
    return { success: true, profile: data[0] };
  } catch (error) {
    console.error("Profile upsert error:", error);
    return { success: false, error: error.message };
  }
};

// Register function using Supabase Auth
export const registerUser = async (name, email, mobile, password, city) => {
  try {
    // Use Supabase Auth to create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      console.error("Auth registration error:", authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Registration failed - no user data returned",
      };
    }

    // Create user profile with additional information (upsert handles conflicts)
    const profileResult = await upsertUserProfile(
      authData.user.id,
      name,
      mobile,
      city
    );

    if (!profileResult.success) {
      console.error("Profile creation failed:", profileResult.error);
      // Note: The auth user was created, but profile creation failed
      // In a real app, you might want to handle this more gracefully
      return {
        success: false,
        error:
          "Account created but profile setup failed. Please contact support.",
      };
    }

    console.log("User registered successfully:", authData.user.email);
    return {
      success: true,
      user: authData.user,
      profile: profileResult.profile,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
};

// Login function using Supabase Auth
export const loginUser = async (email, password) => {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (authError) {
      console.error("Auth login error:", authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Login failed - no user data returned" };
    }

    // Update current user
    currentUser = authData.user;

    // Fetch user profile
    const profileResult = await getUserProfile(authData.user.id);
    if (profileResult.success) {
      currentProfile = profileResult.profile;
    }

    console.log("User logged in successfully:", authData.user.email);
    return {
      success: true,
      user: authData.user,
      profile: currentProfile,
      session: authData.session,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

// Get current user from Supabase auth
export const getCurrentUser = async () => {
  if (currentUser) {
    console.log("Current user from memory:", currentUser.email);
    return currentUser;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    if (user) {
      currentUser = user;
      // Also fetch profile if not in memory
      if (!currentProfile) {
        const profileResult = await getUserProfile(user.id);
        if (profileResult.success) {
          currentProfile = profileResult.profile;
        }
      }
      console.log("Current user from auth:", currentUser.email);
      return currentUser;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }

  console.log("No current user found");
  return null;
};

// Get current user profile
export const getCurrentProfile = async () => {
  if (currentProfile) {
    return currentProfile;
  }

  const user = await getCurrentUser();
  if (user) {
    const profileResult = await getUserProfile(user.id);
    if (profileResult.success) {
      currentProfile = profileResult.profile;
      return currentProfile;
    }
  }

  return null;
};

// Logout user using Supabase auth
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }

    // Clear local state
    currentUser = null;
    currentProfile = null;

    console.log("User logged out successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in logoutUser:", error);
    return { success: false, error: error.message };
  }
};

// Clear current user (legacy - use logoutUser instead)
export const clearCurrentUser = async () => {
  return await logoutUser();
};

// Upload image function with Android/iOS compatibility
export const uploadImage = async (imageUri, fileName) => {
  console.log("Starting image upload...");
  console.log("Image URI:", imageUri);
  console.log("File name:", fileName);
  console.log("Platform:", Platform.OS);

  try {
    let processedUri = imageUri;

    // Android-specific handling for both content:// and file:// URIs
    if (Platform.OS === "android") {
      console.log("Android detected, checking URI type...");

      if (imageUri.startsWith("content://") || imageUri.startsWith("file://")) {
        console.log("Android URI detected, copying to accessible cache...");

        // Copy the file to a temporary location that we can access
        const fileExtension = fileName.split(".").pop() || "jpg";
        const tempFileName = `upload_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;
        const tempUri = `${FileSystem.cacheDirectory}${tempFileName}`;

        try {
          console.log("Copying from:", imageUri);
          console.log("Copying to:", tempUri);

          await FileSystem.copyAsync({
            from: imageUri,
            to: tempUri,
          });

          // Verify the copy was successful
          const copyInfo = await FileSystem.getInfoAsync(tempUri);
          console.log("Copy verification:", copyInfo);

          if (copyInfo.exists && copyInfo.size > 0) {
            processedUri = tempUri;
            console.log("File successfully copied to:", processedUri);
          } else {
            console.log("Copy verification failed, trying direct access...");
            processedUri = imageUri;
          }
        } catch (copyError) {
          console.error("Failed to copy Android URI:", copyError);
          // Try to use the original URI as fallback
          processedUri = imageUri;
        }
      }
    }

    // Get file info first to verify file exists and get size
    console.log("Getting file info for:", processedUri);
    const fileInfo = await FileSystem.getInfoAsync(processedUri);
    console.log("File info:", fileInfo);

    if (!fileInfo.exists) {
      console.error("File does not exist at URI:", processedUri);

      // If on Android and the processed URI failed, try alternative approaches
      if (Platform.OS === "android" && processedUri !== imageUri) {
        console.log("Trying original URI as fallback:", imageUri);
        const originalFileInfo = await FileSystem.getInfoAsync(imageUri);
        console.log("Original file info:", originalFileInfo);

        if (originalFileInfo.exists) {
          processedUri = imageUri;
        } else {
          return {
            success: false,
            error: "File does not exist and cannot be accessed",
          };
        }
      } else {
        return { success: false, error: "File does not exist" };
      }
    }

    if (fileInfo.size === 0) {
      console.error("File is empty (0 bytes)");
      return { success: false, error: "File is empty" };
    }

    console.log("File exists, size:", fileInfo.size, "bytes");

    // Create a unique filename with timestamp
    const fileExt = fileName.split(".").pop() || "jpg";
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    console.log("Unique filename generated:", uniqueFileName);

    console.log("Reading image file as base64...");
    const base64Data = await FileSystem.readAsStringAsync(processedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Base64 read successful, length:", base64Data.length);

    if (base64Data.length === 0) {
      console.error("Base64 data is empty");
      return { success: false, error: "Image data could not be read" };
    }

    // Clean up temp file if we created one
    if (processedUri !== imageUri && processedUri.includes("upload_")) {
      try {
        await FileSystem.deleteAsync(processedUri, { idempotent: true });
        console.log("Temp file cleaned up");
      } catch (cleanupError) {
        console.log(
          "Temp file cleanup failed (not critical):",
          cleanupError.message
        );
      }
    }

    console.log("Converting base64 to ArrayBuffer...");
    const binaryString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    console.log(
      "ArrayBuffer conversion successful, size:",
      arrayBuffer.byteLength,
      "bytes"
    );

    console.log("Uploading to Supabase storage bucket: reports");
    const { data, error } = await supabase.storage
      .from("reports")
      .upload(uniqueFileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return { success: false, error: error.message };
    }

    console.log("Upload successful, storage data:", data);

    const { data: urlData } = supabase.storage
      .from("reports")
      .getPublicUrl(uniqueFileName);

    console.log("Public URL generated:", urlData.publicUrl);
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Upload function error:", error);
    return { success: false, error: error.message };
  }
};

// Create a new report
export const createReport = async (reportData) => {
  console.log("Starting report creation...");

  const user = await getCurrentUser();
  console.log("Current user for report:", user);

  // Validate required fields according to new schema
  if (!reportData.url || reportData.url.trim() === "") {
    console.error("URL is required - no images provided");
    return { success: false, error: "At least one image is required" };
  }

  // Initialize severity for new reports (0 votes = Low severity)
  const initialSeverity = calculateSeverity(0, 0);

  const reportDataWithUser = {
    ...reportData,
    user_id: user?.id || null,
    severity: initialSeverity,
  };

  console.log(
    "Report data with user:",
    JSON.stringify(reportDataWithUser, null, 2)
  );

  try {
    const { data, error } = await supabase
      .from("reports")
      .insert([reportDataWithUser])
      .select();

    if (error) {
      console.error("Report creation error:", error);

      // Handle unique constraint violation for duplicate URLs
      if (
        error.code === "23505" &&
        error.message.includes("unique_reports_url")
      ) {
        return {
          success: false,
          error:
            "This image has already been uploaded in another report. Please use different images.",
        };
      }

      // Handle other constraint violations
      if (error.code === "23502" && error.message.includes("url")) {
        return {
          success: false,
          error: "At least one image is required to create a report.",
        };
      }

      return { success: false, error: error.message };
    }

    console.log(
      "Report created successfully with report_id:",
      data[0].report_id
    );
    return { success: true, report: data[0] };
  } catch (error) {
    console.error("Report creation error:", error);
    return { success: false, error: error.message };
  }
};

// Get reports by user
export const getUserReports = async (userId = null) => {
  console.log("Getting user reports...");

  try {
    let query = supabase
      .from("reports")
      .select("*")
      .order("report_id", { ascending: false }); // Order by newest first using report_id

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      // If no specific user, get current user's reports
      const user = await getCurrentUser();
      if (user) {
        query = query.eq("user_id", user.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reports:", error);
      return { success: false, error: error.message };
    }

    console.log("Reports fetched successfully:", data?.length || 0, "reports");
    return { success: true, reports: data || [] };
  } catch (error) {
    console.error("Error in getUserReports:", error);
    return { success: false, error: error.message };
  }
};

// Get a specific report by report_id
export const getReportById = async (reportId) => {
  console.log("Getting report by ID:", reportId);

  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("report_id", reportId) // Using the new report_id primary key
      .single();

    if (error) {
      console.error("Error fetching report:", error);
      return { success: false, error: error.message };
    }

    console.log("Report fetched successfully:", data);
    return { success: true, report: data };
  } catch (error) {
    console.error("Error in getReportById:", error);
    return { success: false, error: error.message };
  }
};

// Check if URL already exists (useful for preventing duplicates)
export const checkUrlExists = async (url) => {
  console.log("Checking if URL exists:", url);

  try {
    const { data, error } = await supabase
      .from("reports")
      .select("report_id, user_id")
      .eq("url", url)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error checking URL:", error);
      return { success: false, error: error.message };
    }

    const exists = !!data;
    console.log("URL exists:", exists);
    return { success: true, exists, reportData: data };
  } catch (error) {
    console.error("Error in checkUrlExists:", error);
    return { success: false, error: error.message };
  }
};

// Get all reports with pagination (useful for admin/public views)
export const getAllReports = async (limit = 50, offset = 0) => {
  console.log("Getting all reports with pagination...");

  try {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
        *,
        profiles!reports_user_id_fkey (
          name
        )
      `
      )
      .order("report_id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching all reports:", error);
      return { success: false, error: error.message };
    }

    console.log(
      "All reports fetched successfully:",
      data?.length || 0,
      "reports"
    );
    return { success: true, reports: data || [] };
  } catch (error) {
    console.error("Error in getAllReports:", error);
    return { success: false, error: error.message };
  }
};

// Get community feed reports with filtering and sorting
export const getCommunityReports = async () => {
  console.log("Getting community reports");

  try {
    const currentUser = await getCurrentUser();

    // Try multiple query approaches to find what works
    console.log("Attempting query with foreign key syntax...");

    let query = supabase
      .from("reports")
      .select(
        `
        *,
        profiles!user_id (
          name,
          id
        )
      `
      )
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    let { data, error } = await query;

    // If the first query fails or returns no profile data, try alternative syntax
    if (error || (data && data.length > 0 && !data[0].profiles)) {
      console.log(
        "First query failed or no profiles. Trying alternative syntax..."
      );
      console.log("Error from first query:", error?.message);

      query = supabase
        .from("reports")
        .select(
          `
          *,
          profiles (
            name,
            id
          )
        `
        )
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      const result2 = await query;
      if (!result2.error) {
        data = result2.data;
        error = null;
        console.log("Alternative query syntax worked!");
      } else {
        console.log("Alternative query also failed:", result2.error?.message);
      }
    }

    if (error) {
      console.error("Error fetching community reports:", error);
      return { success: false, error: error.message };
    }

    // Enhanced debugging for foreign key relationship
    console.log("=== DEBUGGING FOREIGN KEY RELATIONSHIP ===");
    console.log("Total reports fetched:", data?.length || 0);
    console.log(
      "Raw report data sample:",
      JSON.stringify(data?.slice(0, 1), null, 2)
    );

    // Check if any reports have profile data
    const reportsWithProfilesDebug =
      data?.filter((report) => report.profiles) || [];
    const reportsWithoutProfilesDebug =
      data?.filter((report) => !report.profiles) || [];

    console.log("Reports WITH profile data:", reportsWithProfilesDebug.length);
    console.log(
      "Reports WITHOUT profile data:",
      reportsWithoutProfilesDebug.length
    );

    if (reportsWithoutProfilesDebug.length > 0) {
      console.log("Sample report WITHOUT profile:", {
        report_id: reportsWithoutProfilesDebug[0]?.report_id,
        user_id: reportsWithoutProfilesDebug[0]?.user_id,
        profiles: reportsWithoutProfilesDebug[0]?.profiles,
      });
    }

    if (reportsWithProfilesDebug.length > 0) {
      console.log("Sample report WITH profile:", {
        report_id: reportsWithProfilesDebug[0]?.report_id,
        user_id: reportsWithProfilesDebug[0]?.user_id,
        profiles: reportsWithProfilesDebug[0]?.profiles,
      });
    }

    // Get user votes from local storage
    let userVotes = {};
    if (currentUser) {
      try {
        const userVotesStr =
          (await AsyncStorage.getItem(`user_votes_${currentUser.id}`)) || "{}";
        userVotes = JSON.parse(userVotesStr);
      } catch (error) {
        console.error("Error getting user votes:", error);
      }
    }

    // Fallback: manually fetch missing profile data only if join failed
    const reportsWithProfiles = await Promise.all(
      data?.map(async (report) => {
        if (!report.profiles && report.user_id) {
          console.log(
            `JOIN FAILED: Manually fetching profile for user ${report.user_id}`
          );
          try {
            const profileResult = await getUserProfile(report.user_id);
            if (profileResult.success && profileResult.profile) {
              report.profiles = {
                name: profileResult.profile.name,
                id: profileResult.profile.id,
              };
              console.log(
                `Manual fetch successful: ${profileResult.profile.name}`
              );
            } else {
              console.log(
                `Manual fetch failed for user ${report.user_id}:`,
                profileResult.error
              );
            }
          } catch (error) {
            console.error(
              `Error manually fetching profile for user ${report.user_id}:`,
              error
            );
          }
        } else if (report.profiles) {
          console.log(
            `JOIN SUCCESS: Profile found via join for user ${report.user_id}: ${report.profiles.name}`
          );
        }
        return report;
      }) || []
    );

    // Calculate net votes and use severity from database (fallback to calculation if not present)
    const reportsWithCalculatedSeverity =
      reportsWithProfiles?.map((report) => {
        const upvotes = report.upvote || 0;
        const downvotes = report.downvote || 0;
        const netVotes = upvotes - downvotes;

        // Use severity from database, or calculate it as fallback if not present
        const severity =
          report.severity || calculateSeverity(upvotes, downvotes);

        // Check if this is the current user's post and add "(You)" indicator
        const isCurrentUser = currentUser && report.user_id === currentUser.id;

        // Debug logging for profile data
        if (!report.profiles?.name) {
          console.log(
            `Report ${report.report_id}: Missing profile name. Profile data:`,
            report.profiles
          );
          console.log(
            `User ID: ${report.user_id}, Current User ID: ${currentUser?.id}`
          );
        }

        // Enhanced displayName logic with better fallback
        let displayName;
        if (report.profiles?.name) {
          displayName = isCurrentUser
            ? `${report.profiles.name} (You)`
            : report.profiles.name;
        } else {
          // Fallback: try to get name from user data or use a more descriptive anonymous label
          displayName = isCurrentUser ? "You" : "Anonymous User";
        }

        // Get user's vote for this report
        const userVoteType = userVotes[report.report_id] || null;

        return {
          ...report,
          netVotes,
          severity,
          displayName,
          isCurrentUser,
          userVote: userVoteType,
          status: report.status || "Not Resolved", // Default status
          // Format time for display
          timeAgo: formatTimeAgo(report.date, report.time),
        };
      }) || [];

    console.log(
      "Community reports fetched successfully:",
      reportsWithCalculatedSeverity.length,
      "reports"
    );
    return { success: true, reports: reportsWithCalculatedSeverity };
  } catch (error) {
    console.error("Error in getCommunityReports:", error);
    return { success: false, error: error.message };
  }
};

// Check if user has already voted on this report
export const checkUserVote = async (reportId) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: true, hasVoted: false, voteType: null };
    }

    // For now, we'll use localStorage/AsyncStorage to track votes
    // This is simpler than creating a database table
    const userVotes =
      (await AsyncStorage.getItem(`user_votes_${currentUser.id}`)) || "{}";
    const votesObj = JSON.parse(userVotes);

    const hasVoted = votesObj[reportId] !== undefined;
    const voteType = votesObj[reportId] || null;

    return { success: true, hasVoted, voteType };
  } catch (error) {
    console.error("Error checking user vote:", error);
    return { success: false, error: error.message };
  }
};

// Record user vote locally
const recordUserVote = async (reportId, voteType) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    const userVotes =
      (await AsyncStorage.getItem(`user_votes_${currentUser.id}`)) || "{}";
    const votesObj = JSON.parse(userVotes);

    votesObj[reportId] = voteType;

    await AsyncStorage.setItem(
      `user_votes_${currentUser.id}`,
      JSON.stringify(votesObj)
    );
  } catch (error) {
    console.error("Error recording user vote:", error);
  }
};

// Upvote a report
export const upvoteReport = async (reportId) => {
  console.log("Upvoting report:", reportId);

  try {
    // Check if user has already voted
    const voteCheck = await checkUserVote(reportId);
    if (!voteCheck.success) {
      return { success: false, error: voteCheck.error };
    }

    if (voteCheck.hasVoted && voteCheck.voteType === "upvote") {
      return { success: false, error: "You have already upvoted this report" };
    }

    // Get current vote counts
    const { data: currentData, error: fetchError } = await supabase
      .from("reports")
      .select("upvote, downvote")
      .eq("report_id", reportId)
      .single();

    if (fetchError) {
      console.error("Error fetching current vote counts:", fetchError);
      return { success: false, error: fetchError.message };
    }

    let newUpvoteCount = (currentData.upvote || 0) + 1;
    let newDownvoteCount = currentData.downvote || 0;

    // If user previously downvoted, remove that downvote
    if (voteCheck.hasVoted && voteCheck.voteType === "downvote") {
      newDownvoteCount = Math.max(0, newDownvoteCount - 1);
    }

    // Calculate new severity based on updated vote counts
    const newSeverity = calculateSeverity(newUpvoteCount, newDownvoteCount);

    const { data, error } = await supabase
      .from("reports")
      .update({
        upvote: newUpvoteCount,
        downvote: newDownvoteCount,
        severity: newSeverity,
      })
      .eq("report_id", reportId)
      .select();

    if (error) {
      console.error("Error upvoting report:", error);
      return { success: false, error: error.message };
    }

    // Record the vote locally
    await recordUserVote(reportId, "upvote");

    console.log("Report upvoted successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Error in upvoteReport:", error);
    return { success: false, error: error.message };
  }
};

// Downvote a report
export const downvoteReport = async (reportId) => {
  console.log("Downvoting report:", reportId);

  try {
    // Check if user has already voted
    const voteCheck = await checkUserVote(reportId);
    if (!voteCheck.success) {
      return { success: false, error: voteCheck.error };
    }

    if (voteCheck.hasVoted && voteCheck.voteType === "downvote") {
      return {
        success: false,
        error: "You have already downvoted this report",
      };
    }

    // Get current vote counts
    const { data: currentData, error: fetchError } = await supabase
      .from("reports")
      .select("upvote, downvote")
      .eq("report_id", reportId)
      .single();

    if (fetchError) {
      console.error("Error fetching current vote counts:", fetchError);
      return { success: false, error: fetchError.message };
    }

    let newDownvoteCount = (currentData.downvote || 0) + 1;
    let newUpvoteCount = currentData.upvote || 0;

    // If user previously upvoted, remove that upvote
    if (voteCheck.hasVoted && voteCheck.voteType === "upvote") {
      newUpvoteCount = Math.max(0, newUpvoteCount - 1);
    }

    // Calculate new severity based on updated vote counts
    const newSeverity = calculateSeverity(newUpvoteCount, newDownvoteCount);

    const { data, error } = await supabase
      .from("reports")
      .update({
        upvote: newUpvoteCount,
        downvote: newDownvoteCount,
        severity: newSeverity,
      })
      .eq("report_id", reportId)
      .select();

    if (error) {
      console.error("Error downvoting report:", error);
      return { success: false, error: error.message };
    }

    // Record the vote locally
    await recordUserVote(reportId, "downvote");

    console.log("Report downvoted successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Error in downvoteReport:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to calculate severity based on net votes
export const calculateSeverity = (upvotes, downvotes) => {
  const netVotes = (upvotes || 0) - (downvotes || 0);

  if (netVotes >= 10) {
    return "Critical";
  } else if (netVotes >= 5) {
    return "High";
  } else if (netVotes >= 2) {
    return "Medium";
  } else {
    return "Low";
  }
};

// Helper function to format time ago
const formatTimeAgo = (date, time) => {
  try {
    const reportDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffInMinutes = Math.floor((now - reportDateTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  } catch (error) {
    console.error("Error formatting time ago:", error);
    return time.substring(0, 5); // Return HH:MM format as fallback
  }
};

// Fetch fresh user profile by ID
export const fetchUserById = async (userId) => {
  try {
    // Fetch user profile from profiles table
    const profileResult = await getUserProfile(userId);

    if (!profileResult.success) {
      return { success: false, error: profileResult.error };
    }

    console.log("User profile fetched successfully");
    return { success: true, profile: profileResult.profile };
  } catch (error) {
    console.error("Error in fetchUserById:", error);
    return { success: false, error: error.message };
  }
};

// Utility function to update severity for existing reports (migration helper)
export const updateExistingReportsSeverity = async () => {
  console.log("Updating severity for existing reports...");

  try {
    // Get all reports that don't have severity set or have null severity
    const { data: reports, error: fetchError } = await supabase
      .from("reports")
      .select("report_id, upvote, downvote, severity")
      .or("severity.is.null,severity.eq.''");

    if (fetchError) {
      console.error("Error fetching reports for severity update:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!reports || reports.length === 0) {
      console.log("No reports need severity updates");
      return { success: true, updated: 0 };
    }

    console.log(`Found ${reports.length} reports to update`);

    // Update each report with calculated severity
    const updatePromises = reports.map(async (report) => {
      const severity = calculateSeverity(report.upvote, report.downvote);

      return supabase
        .from("reports")
        .update({ severity })
        .eq("report_id", report.report_id);
    });

    const results = await Promise.all(updatePromises);

    // Check for any errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error("Some updates failed:", errors);
      return { success: false, error: "Some updates failed", errors };
    }

    console.log(`Successfully updated severity for ${reports.length} reports`);
    return { success: true, updated: reports.length };
  } catch (error) {
    console.error("Error in updateExistingReportsSeverity:", error);
    return { success: false, error: error.message };
  }
};

// Update user points (for redemptions)
export const updateUserPoints = async (userId, newPoints) => {
  try {
    console.log(
      "Updating user points for userId:",
      userId,
      "New points:",
      newPoints
    );

    // First, check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, name, points")
      .eq("id", userId)
      .single();

    if (checkError || !existingProfile) {
      console.error("User profile not found:", checkError);
      return { success: false, error: "User profile not found" };
    }

    console.log(
      "Found user profile:",
      existingProfile.name,
      "Current points:",
      existingProfile.points
    );

    // Update points in profiles table
    const { data, error } = await supabase
      .from("profiles")
      .update({
        points: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*");

    console.log("Update query result:", {
      data,
      error,
      rowsAffected: data?.length,
    });

    if (error) {
      console.error("Error updating user points:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error("No rows updated - likely RLS policy issue");

      return {
        success: false,
        error:
          "Unable to update user points. This might be due to database security policies. Please check your Supabase RLS settings.",
      };
    }

    const updatedProfile = data[0];
    console.log(
      "User points updated successfully:",
      updatedProfile.name,
      "New points:",
      updatedProfile.points
    );

    // Update current profile in memory
    if (currentUser && currentUser.id === userId) {
      currentProfile = updatedProfile;
    }

    return { success: true, profile: updatedProfile };
  } catch (error) {
    console.error("Error in updateUserPoints:", error);
    return { success: false, error: error.message };
  }
};
