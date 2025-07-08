import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  display_name: string
  email: string
  phone?: string
  address?: string
}

interface ProfileState {
  profile: Profile | null
  loading: boolean
  error: string | null
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
}

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, phone, address')
      .eq('id', userId)
      .single()
    if (error) return rejectWithValue(error.message)
    return data as Profile
  }
)

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profile: Profile, { rejectWithValue }) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        display_name: profile.display_name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      })
    if (error) return rejectWithValue(error.message)
    return profile
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default profileSlice.reducer 