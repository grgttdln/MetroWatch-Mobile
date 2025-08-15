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
      return { success: false, error: error.message }
    }
    
    console.log('Report created successfully:', data[0])
    return { success: true, report: data[0] }
  } catch (error) {
    console.error('Report creation error:', error)
    return { success: false, error: error.message }
  }
}