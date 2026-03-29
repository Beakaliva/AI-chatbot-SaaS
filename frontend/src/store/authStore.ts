import { create } from "zustand"
import Cookies from "js-cookie"
import { User } from "@/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isAuthenticated: !!Cookies.get("access_token"),

  setUser: (user) => set({ user, isAuthenticated: true }),

  setTokens: (access, refresh) => {
    Cookies.set("access_token",  access,  { expires: 1 })
    Cookies.set("refresh_token", refresh, { expires: 7 })
    set({ isAuthenticated: true })
  },

  logout: () => {
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    set({ user: null, isAuthenticated: false })
  },
}))