import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types/auth'
import { authApi } from '../../api/authApi'

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type { AuthState }

/**
 * Hydrate the initial state from localStorage so a page refresh
 * keeps the user logged in until the server verifies the token.
 */
function loadInitialState(): AuthState {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')

  return {
    token,
    user: savedUser ? (JSON.parse(savedUser) as User) : null,
    isAuthenticated: !!token,
    // Start in loading state if we have a token to verify, otherwise we're done.
    isLoading: !!token,
  }
}

/* -------------------------------------------------------------------------- */
/*  Async thunks                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Verify the stored token by fetching the user profile from the API.
 * Dispatched once on app startup (see App.tsx) when a token exists.
 *
 * - On success: the fresh user is stored in state + localStorage.
 * - On failure: the token is cleared (treated as expired/invalid).
 */
export const verifyAuth = createAsyncThunk<User, void, { rejectValue: void }>(
  'auth/verifyAuth',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authApi.getProfile()
      localStorage.setItem('user', JSON.stringify(profile))
      return profile
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return rejectWithValue(undefined)
    }
  }
)

/**
 * Log the user out by calling the server logout endpoint, then clearing
 * local state + storage. Network failures are swallowed so the user is
 * always logged out client-side even if the API call fails.
 */
export const logoutUser = createAsyncThunk<void, void, { rejectValue: void }>(
  'auth/logoutUser',
  async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore failure during logout — we clear local state regardless.
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
)

/* -------------------------------------------------------------------------- */
/*  Slice                                                                     */
/* -------------------------------------------------------------------------- */

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState,
  reducers: {
    /**
     * Set credentials after a successful login or signup.
     * Persists to localStorage and updates state in one place.
     */
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      const { token, user } = action.payload
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      state.token = token
      state.user = user
      state.isAuthenticated = true
    },

    /**
     * Replace just the user object (e.g. after a profile update).
     */
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload))
      } else {
        localStorage.removeItem('user')
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // verifyAuth -----------------------------------------------------------
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isLoading = false
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
      })
      // logoutUser -----------------------------------------------------------
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { setCredentials, setUser } = authSlice.actions
export default authSlice.reducer
