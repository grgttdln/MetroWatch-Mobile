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
    
    // Android-specific handling for content:// URIs
    if (Platform.OS === 'android' && imageUri.startsWith('content://')) {
      console.log('Android content URI detected, copying to cache...')
      
      // Copy the file to a temporary location that we can access
      const fileExtension = fileName.split('.').pop() || 'jpg'
      const tempFileName = `temp_${Date.now()}.${fileExtension}`
      const tempUri = `${FileSystem.cacheDirectory}${tempFileName}`
      
      try {
        await FileSystem.copyAsync({
          from: imageUri,
          to: tempUri
        })
        processedUri = tempUri
        console.log('File copied to temp location:', processedUri)
      } catch (copyError) {
        console.error('Failed to copy Android content URI:', copyError)
        processedUri = imageUri
      }
    }
    
    // Get file info first to verify file exists and get size
    console.log('Getting file info for:', processedUri)
    const fileInfo = await FileSystem.getInfoAsync(processedUri)
    console.log('File info:', fileInfo)
    
    if (!fileInfo.exists) {
      console.error('File does not exist at URI:', processedUri)
      return { success: false, error: 'File does not exist' }
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
    if (processedUri !== imageUri && processedUri.includes('temp_')) {
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