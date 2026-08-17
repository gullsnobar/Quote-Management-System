import api from './axios'
import type { AuthResponse, LoginPayload, SignupPayload, User } from '../types/auth'

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload)
    return response.data
  },

  async signup(payload: SignupPayload): Promise<{ data: User }> {
    const response = await api.post<{ data: User }>('/auth/signup', payload)
    return response.data
  },

  async getProfile(): Promise<{ data: User }> {
    const response = await api.get<{ data: User }>('/account/profile')
    return response.data
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/account/logout')
    return response.data
  },
}
