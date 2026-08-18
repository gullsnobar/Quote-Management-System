export interface User {
  id: number
  fullName: string | null
  email: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
}
