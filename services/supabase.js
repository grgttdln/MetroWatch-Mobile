import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import * as FileSystem from 'expo-file-system'

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
      console.log('🚀 App initialized with user:', currentUser.email)
      return currentUser
    }
  } catch (error) {
    console.error('Error initializing current user:', error)
  }
  console.log('🚀 App initialized without user session')
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
          password: password, // Note: In production, you should hash this
          city: city
        }
      ])
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Set current user (call after successful login)
export const setCurrentUser = async (user) => {
  currentUser = user
  await AsyncStorage.setItem('currentUser', JSON.stringify(user))
  console.log('👤 Current user set:', user)
}

// Get current user
export const getCurrentUser = async () => {
  if (currentUser) {
    return currentUser
  }
  
  try {
    const storedUser = await AsyncStorage.getItem('currentUser')
    if (storedUser) {
      currentUser = JSON.parse(storedUser)
      console.log('👤 Current user retrieved from storage:', currentUser)
      return currentUser
    }
  } catch (error) {
    console.error('Error retrieving current user:', error)
  }
  
  console.log('❌ No current user found')
  return null
}

// Clear current user (call on logout)
export const clearCurrentUser = async () => {
  currentUser = null
  await AsyncStorage.removeItem('currentUser')
  console.log('👤 Current user cleared')
}

// Login function
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password) // Note: In production, you should hash and compare
      .single()

    if (error || !data) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Set the current user after successful login
    await setCurrentUser(data)
    return { success: true, user: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Upload image to Supabase storage
export const uploadImage = async (imageUri, fileName) => {
  console.log('🚀 Starting image upload...');
  console.log('📷 Image URI:', imageUri);
  console.log('📁 File name:', fileName);
  
  try {
    console.log('📖 Reading image file as base64...');
    // Read the image file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    })
    console.log('✅ Base64 conversion successful, length:', base64.length);
    
    console.log('🔄 Converting base64 to blob...');
    // Convert base64 to blob
    const response = await fetch(`data:image/jpeg;base64,${base64}`)
    const blob = await response.blob()
    console.log('✅ Blob conversion successful, size:', blob.size, 'bytes');
    
    // Create a unique filename with timestamp
    const fileExt = fileName.split('.').pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    console.log('📝 Unique filename generated:', uniqueFileName);
    
    console.log('☁️ Uploading to Supabase storage bucket: reports');
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('reports')
      .upload(uniqueFileName, blob, {
        contentType: `image/${fileExt}`,
        upsert: false
      })
    
    if (error) {
      console.error('❌ Storage upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message }
    }
    
    console.log('✅ Upload successful, storage data:', data);
    
    console.log('🔗 Getting public URL...');
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(uniqueFileName)
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('💥 Upload function error:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message }
  }
}

// Create a new report
export const createReport = async (reportData) => {
  console.log('📊 Starting report creation...');
  
  // Get current user
  const user = await getCurrentUser()
  console.log('� Current user for report:', user)
  
  // Add user ID to report data
  const reportDataWithUser = {
    ...reportData,
    id: user ? user.id : null // Add user ID to existing id column
  }
  
  console.log('�📋 Report data to insert:', JSON.stringify(reportDataWithUser, null, 2));
  
  try {
    console.log('💾 Inserting report into database...');
    const { data, error } = await supabase
      .from('reports')
      .insert([reportDataWithUser])
      .select()
    
    if (error) {
      console.error('❌ Database insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's specifically an RLS error
      if (error.message.includes('row-level security') || error.code === '42501') {
        console.error('🔒 This is a Row Level Security (RLS) error!');
        console.error('🔧 Possible solutions:');
        console.error('1. Disable RLS: ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;');
        console.error('2. Create policy: CREATE POLICY "Anyone can insert reports" ON reports FOR INSERT WITH CHECK (true);');
      }
      
      return { success: false, error: error.message }
    }
    
    console.log('✅ Report inserted successfully!');
    console.log('📄 Inserted report:', JSON.stringify(data[0], null, 2));
    return { success: true, report: data[0] }
  } catch (error) {
    console.error('💥 Report creation function error:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message }
  }
}

// Get all reports (for dashboard)
export const getAllReports = async () => {
  console.log('📊 Fetching all reports...');
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching reports:', error);
      return { success: false, error: error.message }
    }
    
    console.log('✅ Reports fetched successfully:', data?.length || 0, 'reports');
    return { success: true, reports: data || [] }
  } catch (error) {
    console.error('💥 Error in getAllReports:', error);
    return { success: false, error: error.message }
  }
}

// Get reports by current user
export const getUserReports = async () => {
  console.log('📊 Fetching user reports...');
  const user = await getCurrentUser()
  
  if (!user) {
    console.log('❌ No current user found');
    return { success: false, error: 'No user logged in' }
  }
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', user.id)
      .order('date', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching user reports:', error);
      return { success: false, error: error.message }
    }
    
    console.log('✅ User reports fetched successfully:', data?.length || 0, 'reports');
    return { success: true, reports: data || [] }
  } catch (error) {
    console.error('💥 Error in getUserReports:', error);
    return { success: false, error: error.message }
  }
}

