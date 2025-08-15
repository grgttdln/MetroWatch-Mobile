import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Current user state
let currentUser = null

// Initialize current user from storage (call on app start)
export const initializeCurrentUser = async () => {
  try {
    const storedUser = await AsyncStorage.getItem('currentUser')
    if (storedUser) {
      currentUser = JSON.parse(storedUser)
      console.log('App initialized with user:', currentUser.email)
      return currentUser
    }
  } catch (error) {
    console.error('Error initializing current user:', error)
  }
  console.log('App initialized without user session')
  return null
}

// Register function
export const registerUser = async (name, email, mobile, password, city) => {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name,
          email: email,
          mobile: mobile,
          password: password,
          city: city,
        },
      ])
      .select()

    if (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }

    console.log('User registered successfully:', data[0])
    return { success: true, user: data[0] }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: error.message }
  }
}

// Login function
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single()

    if (error || !data) {
      console.error('Login error:', error)
      return { success: false, error: 'Invalid email or password' }
    }

    // Store user session
    await setCurrentUser(data)
    console.log('User logged in successfully:', data.email)
    return { success: true, user: data }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: error.message }
  }
}

// Set current user
export const setCurrentUser = async (user) => {
  try {
    currentUser = user
    await AsyncStorage.setItem('currentUser', JSON.stringify(user))
    console.log('User session saved:', user.email)
  } catch (error) {
    console.error('Error saving user session:', error)
  }
}

// Get current user
export const getCurrentUser = async () => {
  if (currentUser) {
    console.log('Current user from memory:', currentUser.email)
    return currentUser
  }

  try {
    const storedUser = await AsyncStorage.getItem('currentUser')
    if (storedUser) {
      currentUser = JSON.parse(storedUser)
      console.log('Current user from storage:', currentUser.email)
      return currentUser
    }
  } catch (error) {
    console.error('Error getting current user:', error)
  }

  console.log('No current user found')
  return null
}

// Clear current user (logout)
export const clearCurrentUser = async () => {
  try {
    currentUser = null
    await AsyncStorage.removeItem('currentUser')
    console.log('User session cleared')
  } catch (error) {
    console.error('Error clearing user session:', error)
  }
}

// Upload image function with Android/iOS compatibility
export const uploadImage = async (imageUri, fileName) => {
  console.log('Starting image upload...')
  console.log('Image URI:', imageUri)
  console.log('File name:', fileName)
  console.log('Platform:', Platform.OS)
  
  try {
    let processedUri = imageUri
    
    // Android-specific handling for both content:// and file:// URIs
    if (Platform.OS === 'android') {
      console.log('Android detected, checking URI type...')
      
      if (imageUri.startsWith('content://') || imageUri.startsWith('file://')) {
        console.log('Android URI detected, copying to accessible cache...')
        
        // Copy the file to a temporary location that we can access
        const fileExtension = fileName.split('.').pop() || 'jpg'
        const tempFileName = `upload_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`
        const tempUri = `${FileSystem.cacheDirectory}${tempFileName}`
        
        try {
          console.log('Copying from:', imageUri)
          console.log('Copying to:', tempUri)
          
          await FileSystem.copyAsync({
            from: imageUri,
            to: tempUri
          })
          
          // Verify the copy was successful
          const copyInfo = await FileSystem.getInfoAsync(tempUri)
          console.log('Copy verification:', copyInfo)
          
          if (copyInfo.exists && copyInfo.size > 0) {
            processedUri = tempUri
            console.log('File successfully copied to:', processedUri)
          } else {
            console.log('Copy verification failed, trying direct access...')
            processedUri = imageUri
          }
        } catch (copyError) {
          console.error('Failed to copy Android URI:', copyError)
          // Try to use the original URI as fallback
          processedUri = imageUri
        }
      }
    }
    
    // Get file info first to verify file exists and get size
    console.log('Getting file info for:', processedUri)
    const fileInfo = await FileSystem.getInfoAsync(processedUri)
    console.log('File info:', fileInfo)
    
    if (!fileInfo.exists) {
      console.error('File does not exist at URI:', processedUri)
      
      // If on Android and the processed URI failed, try alternative approaches
      if (Platform.OS === 'android' && processedUri !== imageUri) {
        console.log('Trying original URI as fallback:', imageUri)
        const originalFileInfo = await FileSystem.getInfoAsync(imageUri)
        console.log('Original file info:', originalFileInfo)
        
        if (originalFileInfo.exists) {
          processedUri = imageUri
        } else {
          return { success: false, error: 'File does not exist and cannot be accessed' }
        }
      } else {
        return { success: false, error: 'File does not exist' }
      }
    }
    
    if (fileInfo.size === 0) {
      console.error('File is empty (0 bytes)')
      return { success: false, error: 'File is empty' }
    }
    
    console.log('File exists, size:', fileInfo.size, 'bytes')
    
    // Create a unique filename with timestamp
    const fileExt = fileName.split('.').pop() || 'jpg'
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    console.log('Unique filename generated:', uniqueFileName)
    
    console.log('Reading image file as base64...')
    const base64Data = await FileSystem.readAsStringAsync(processedUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    
    console.log('Base64 read successful, length:', base64Data.length)
    
    if (base64Data.length === 0) {
      console.error('Base64 data is empty')
      return { success: false, error: 'Image data could not be read' }
    }
    
    // Clean up temp file if we created one
    if (processedUri !== imageUri && processedUri.includes('upload_')) {
      try {
        await FileSystem.deleteAsync(processedUri, { idempotent: true })
        console.log('Temp file cleaned up')
      } catch (cleanupError) {
        console.log('Temp file cleanup failed (not critical):', cleanupError.message)
      }
    }
    
    console.log('Converting base64 to ArrayBuffer...')
    const binaryString = atob(base64Data)
    const arrayBuffer = new ArrayBuffer(binaryString.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i)
    }
    
    console.log('ArrayBuffer conversion successful, size:', arrayBuffer.byteLength, 'bytes')
    
    console.log('Uploading to Supabase storage bucket: reports')
    const { data, error } = await supabase.storage
      .from('reports')
      .upload(uniqueFileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false
      })
    
    if (error) {
      console.error('Storage upload error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Upload successful, storage data:', data)
    
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(uniqueFileName)
    
    console.log('Public URL generated:', urlData.publicUrl)
    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Upload function error:', error)
    return { success: false, error: error.message }
  }
}

// Create a new report
export const createReport = async (reportData) => {
  console.log('Starting report creation...')
  
  const user = await getCurrentUser()
  console.log('Current user for report:', user)
  
  // Validate required fields according to new schema
  if (!reportData.url || reportData.url.trim() === '') {
    console.error('URL is required - no images provided')
    return { success: false, error: 'At least one image is required' }
  }
  
  const reportDataWithUser = {
    ...reportData,
    user_id: user?.id || null
  }
  
  console.log('Report data with user:', JSON.stringify(reportDataWithUser, null, 2))
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([reportDataWithUser])
      .select()
    
    if (error) {
      console.error('Report creation error:', error)
      
      // Handle unique constraint violation for duplicate URLs
      if (error.code === '23505' && error.message.includes('unique_reports_url')) {
        return { 
          success: false, 
          error: 'This image has already been uploaded in another report. Please use different images.' 
        }
      }
      
      // Handle other constraint violations
      if (error.code === '23502' && error.message.includes('url')) {
        return { 
          success: false, 
          error: 'At least one image is required to create a report.' 
        }
      }
      
      return { success: false, error: error.message }
    }
    
    console.log('Report created successfully with report_id:', data[0].report_id)
    return { success: true, report: data[0] }
  } catch (error) {
    console.error('Report creation error:', error)
    return { success: false, error: error.message }
  }
}

// Get reports by user
export const getUserReports = async (userId = null) => {
  console.log('Getting user reports...')
  
  try {
    let query = supabase
      .from('reports')
      .select('*')
      .order('report_id', { ascending: false }) // Order by newest first using report_id
    
    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      // If no specific user, get current user's reports
      const user = await getCurrentUser()
      if (user) {
        query = query.eq('user_id', user.id)
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching reports:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Reports fetched successfully:', data?.length || 0, 'reports')
    return { success: true, reports: data || [] }
  } catch (error) {
    console.error('Error in getUserReports:', error)
    return { success: false, error: error.message }
  }
}

// Get a specific report by report_id
export const getReportById = async (reportId) => {
  console.log('Getting report by ID:', reportId)
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('report_id', reportId) // Using the new report_id primary key
      .single()
    
    if (error) {
      console.error('Error fetching report:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Report fetched successfully:', data)
    return { success: true, report: data }
  } catch (error) {
    console.error('Error in getReportById:', error)
    return { success: false, error: error.message }
  }
}

// Check if URL already exists (useful for preventing duplicates)
export const checkUrlExists = async (url) => {
  console.log('Checking if URL exists:', url)
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('report_id, user_id')
      .eq('url', url)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking URL:', error)
      return { success: false, error: error.message }
    }
    
    const exists = !!data
    console.log('URL exists:', exists)
    return { success: true, exists, reportData: data }
  } catch (error) {
    console.error('Error in checkUrlExists:', error)
    return { success: false, error: error.message }
  }
}

// Get all reports with pagination (useful for admin/public views)
export const getAllReports = async (limit = 50, offset = 0) => {
  console.log('Getting all reports with pagination...')
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        users!fk_reports_user (
          name,
          email
        )
      `)
      .order('report_id', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching all reports:', error)
      return { success: false, error: error.message }
    }
    
    console.log('All reports fetched successfully:', data?.length || 0, 'reports')
    return { success: true, reports: data || [] }
  } catch (error) {
    console.error('Error in getAllReports:', error)
    return { success: false, error: error.message }
  }
}

// Get community feed reports with filtering and sorting
export const getCommunityReports = async () => {
  console.log('Getting community reports')
  
  try {
    const currentUser = await getCurrentUser()
    
    let query = supabase
      .from('reports')
      .select(`
        *,
        users!fk_reports_user (
          name,
          email
        )
      `)
      .order('date', { ascending: false })
      .order('time', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching community reports:', error)
      return { success: false, error: error.message }
    }
    
    // Get user votes from local storage
    let userVotes = {}
    if (currentUser) {
      try {
        const userVotesStr = await AsyncStorage.getItem(`user_votes_${currentUser.id}`) || '{}'
        userVotes = JSON.parse(userVotesStr)
      } catch (error) {
        console.error('Error getting user votes:', error)
      }
    }
    
    // Calculate net votes and severity for each report
    const reportsWithCalculatedSeverity = data?.map(report => {
      const upvotes = report.upvote || 0
      const downvotes = report.downvote || 0
      const netVotes = upvotes - downvotes
      
      // Calculate severity based on net votes
      let severity = 'Low'
      if (netVotes >= 10) {
        severity = 'Critical'
      } else if (netVotes >= 5) {
        severity = 'High'
      } else if (netVotes >= 2) {
        severity = 'Medium'
      }
      
      // Check if this is the current user's post and add "(You)" indicator
      const isCurrentUser = currentUser && report.user_id === currentUser.id
      const displayName = isCurrentUser 
        ? `${report.users?.name || 'Anonymous'} (You)`
        : (report.users?.name || 'Anonymous')
      
      // Get user's vote for this report
      const userVoteType = userVotes[report.report_id] || null
      
      return {
        ...report,
        netVotes,
        severity,
        displayName,
        isCurrentUser,
        userVote: userVoteType,
        status: report.status || 'Not Resolved', // Default status
        // Format time for display
        timeAgo: formatTimeAgo(report.date, report.time)
      }
    }) || []
    
    console.log('Community reports fetched successfully:', reportsWithCalculatedSeverity.length, 'reports')
    return { success: true, reports: reportsWithCalculatedSeverity }
  } catch (error) {
    console.error('Error in getCommunityReports:', error)
    return { success: false, error: error.message }
  }
}

// Check if user has already voted on this report
export const checkUserVote = async (reportId) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: true, hasVoted: false, voteType: null }
    }

    // For now, we'll use localStorage/AsyncStorage to track votes
    // This is simpler than creating a database table
    const userVotes = await AsyncStorage.getItem(`user_votes_${currentUser.id}`) || '{}'
    const votesObj = JSON.parse(userVotes)
    
    const hasVoted = votesObj[reportId] !== undefined
    const voteType = votesObj[reportId] || null
    
    return { success: true, hasVoted, voteType }
  } catch (error) {
    console.error('Error checking user vote:', error)
    return { success: false, error: error.message }
  }
}

// Record user vote locally
const recordUserVote = async (reportId, voteType) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return

    const userVotes = await AsyncStorage.getItem(`user_votes_${currentUser.id}`) || '{}'
    const votesObj = JSON.parse(userVotes)
    
    votesObj[reportId] = voteType
    
    await AsyncStorage.setItem(`user_votes_${currentUser.id}`, JSON.stringify(votesObj))
  } catch (error) {
    console.error('Error recording user vote:', error)
  }
}

// Upvote a report
export const upvoteReport = async (reportId) => {
  console.log('Upvoting report:', reportId)
  
  try {
    // Check if user has already voted
    const voteCheck = await checkUserVote(reportId)
    if (!voteCheck.success) {
      return { success: false, error: voteCheck.error }
    }
    
    if (voteCheck.hasVoted && voteCheck.voteType === 'upvote') {
      return { success: false, error: 'You have already upvoted this report' }
    }

    // Get current vote counts
    const { data: currentData, error: fetchError } = await supabase
      .from('reports')
      .select('upvote, downvote')
      .eq('report_id', reportId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching current vote counts:', fetchError)
      return { success: false, error: fetchError.message }
    }
    
    let newUpvoteCount = (currentData.upvote || 0) + 1
    let newDownvoteCount = currentData.downvote || 0
    
    // If user previously downvoted, remove that downvote
    if (voteCheck.hasVoted && voteCheck.voteType === 'downvote') {
      newDownvoteCount = Math.max(0, newDownvoteCount - 1)
    }
    
    const { data, error } = await supabase
      .from('reports')
      .update({ 
        upvote: newUpvoteCount,
        downvote: newDownvoteCount 
      })
      .eq('report_id', reportId)
      .select()
    
    if (error) {
      console.error('Error upvoting report:', error)
      return { success: false, error: error.message }
    }
    
    // Record the vote locally
    await recordUserVote(reportId, 'upvote')
    
    console.log('Report upvoted successfully')
    return { success: true, data }
  } catch (error) {
    console.error('Error in upvoteReport:', error)
    return { success: false, error: error.message }
  }
}

// Downvote a report
export const downvoteReport = async (reportId) => {
  console.log('Downvoting report:', reportId)
  
  try {
    // Check if user has already voted
    const voteCheck = await checkUserVote(reportId)
    if (!voteCheck.success) {
      return { success: false, error: voteCheck.error }
    }
    
    if (voteCheck.hasVoted && voteCheck.voteType === 'downvote') {
      return { success: false, error: 'You have already downvoted this report' }
    }

    // Get current vote counts
    const { data: currentData, error: fetchError } = await supabase
      .from('reports')
      .select('upvote, downvote')
      .eq('report_id', reportId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching current vote counts:', fetchError)
      return { success: false, error: fetchError.message }
    }
    
    let newDownvoteCount = (currentData.downvote || 0) + 1
    let newUpvoteCount = currentData.upvote || 0
    
    // If user previously upvoted, remove that upvote
    if (voteCheck.hasVoted && voteCheck.voteType === 'upvote') {
      newUpvoteCount = Math.max(0, newUpvoteCount - 1)
    }
    
    const { data, error } = await supabase
      .from('reports')
      .update({ 
        upvote: newUpvoteCount,
        downvote: newDownvoteCount 
      })
      .eq('report_id', reportId)
      .select()
    
    if (error) {
      console.error('Error downvoting report:', error)
      return { success: false, error: error.message }
    }
    
    // Record the vote locally
    await recordUserVote(reportId, 'downvote')
    
    console.log('Report downvoted successfully')
    return { success: true, data }
  } catch (error) {
    console.error('Error in downvoteReport:', error)
    return { success: false, error: error.message }
  }
}

// Helper function to format time ago
const formatTimeAgo = (date, time) => {
  try {
    const reportDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diffInMinutes = Math.floor((now - reportDateTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  } catch (error) {
    console.error('Error formatting time ago:', error)
    return time.substring(0, 5) // Return HH:MM format as fallback
  }
}


// Fetch fresh user data by ID
export const fetchUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user by ID:', error)
      return { success: false, error: error.message }
    }

    console.log('User data fetched successfully:', data.email)
    return { success: true, user: data }
  } catch (error) {
    console.error('Error in fetchUserById:', error)
    return { success: false, error: error.message }
  }
}

// Update user points (for redemptions)
export const updateUserPoints = async (userId, newPoints) => {
  try {
    console.log('Updating user points for userId:', userId, 'New points:', newPoints)
    
    // First, check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, points')
      .eq('id', userId)
      .single()

    if (checkError || !existingUser) {
      console.error('User not found:', checkError)
      return { success: false, error: 'User not found' }
    }

    console.log('Found user:', existingUser.email, 'Current points:', existingUser.points)

    // Try updating with RPC function first (bypasses RLS if function has proper security definer)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_points', {
        user_id: userId,
        new_points: newPoints
      })

      if (!rpcError && rpcData) {
        console.log('Points updated via RPC successfully')
        
        // Fetch updated user data
        const { data: updatedUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (updatedUser) {
          // Update current user in memory
          if (currentUser && currentUser.id === userId) {
            currentUser.points = newPoints
            currentUser.updated_at = updatedUser.updated_at
            await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser))
          }
          
          return { success: true, user: updatedUser }
        }
      }
    } catch (rpcError) {
      console.log('RPC function not available, trying direct update')
    }

    // Fallback to direct update
    const { data, error, count } = await supabase
      .from('users')
      .update({ points: newPoints, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*')

    console.log('Update query result:', { data, error, count, rowsAffected: data?.length })

    if (error) {
      console.error('Error updating user points:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      console.error('No rows updated - likely RLS policy issue')
      
      // Try to check current RLS policies
      console.log('This might be a Row Level Security (RLS) issue.')
      console.log('Please check your Supabase RLS policies for the users table.')
      
      return { 
        success: false, 
        error: 'Unable to update user points. This might be due to database security policies. Please check your Supabase RLS settings.' 
      }
    }

    const updatedUser = data[0]
    console.log('User points updated successfully:', updatedUser.email, 'New points:', updatedUser.points)
    
    // Update current user in memory
    if (currentUser && currentUser.id === userId) {
      currentUser.points = newPoints
      currentUser.updated_at = updatedUser.updated_at
      await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
    
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error in updateUserPoints:', error)
    return { success: false, error: error.message }
  }
}