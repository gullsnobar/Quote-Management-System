import api from './axios'
import type { AuthResponse, LoginPayload, SignupPayload, User } from '../types/auth'

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', payload)
    return response.data.data
  },

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/signup', payload)
    return response.data.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/account/profile')
    return response.data.data
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/account/logout')
    return response.data
  },
}
