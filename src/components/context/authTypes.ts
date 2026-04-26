import { createContext } from "react"

export interface User {
  _id: string
  email: string
  name: string
  // Some backends return numeric role ids ("1" | "2" | "3"), while others return named roles.
  role: "admin" | "staff" | "user" | "1" | "2" | "3"
  avatar?: string
  roleID?: string | number
  roleId?: string | number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ user: User; token: string }>
  register: (fullName: string, email: string, password: string) => Promise<{ user: User; token: string }>
  logout: () => void
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const TOKEN_KEY = "token"
export const USER_KEY = "user"
