import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'light' | 'dark'
  language: 'es' | 'en'
  sidebarOpen: boolean
  toggleTheme: () => void
  setLanguage: (lang: 'es' | 'en') => void
  toggleSidebar: () => void
}

export const useThemeStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'es',
      sidebarOpen: true,
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(next)
        set({ theme: next })
      },
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'panol-ui' }
  )
)
