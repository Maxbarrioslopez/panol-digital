import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  rut: string
  nombre: string
  email: string | null
  rol: string
  rolId: number
  permisos: string[]
  debeCambiarClave: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      initAuth: () => {
        const { token } = get()
        if (!token) set({ isAuthenticated: false })
      },
    }),
    { name: 'panol-auth' }
  )
)
