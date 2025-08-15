import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

    return { success: true, user: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

