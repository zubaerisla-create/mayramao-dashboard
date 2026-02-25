// lib/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  role: string
  is_user_info_complete: boolean
  is_profile_info_complete: boolean
  is_verified: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  resetEmail: string | null
  otpSent: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  resetEmail: null,
  otpSent: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.error = null
    },
    
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.resetEmail = null
      state.otpSent = false
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    setResetEmail: (state, action: PayloadAction<string>) => {
      state.resetEmail = action.payload
    },
    
    setOtpSent: (state, action: PayloadAction<boolean>) => {
      state.otpSent = action.payload
    },
    
    clearResetState: (state) => {
      state.resetEmail = null
      state.otpSent = false
      state.error = null
    },
  },
})

export const { 
  setCredentials, 
  logout, 
  setLoading,
  setError,
  setResetEmail,
  setOtpSent,
  clearResetState,
} = authSlice.actions

export default authSlice.reducer