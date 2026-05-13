import { useEffect, useState, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { CambiarClave } from '../pages/auth/CambiarClave'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, initAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/recuperar-clave') {
      navigate('/login')
    }
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/')
    }
  }, [isAuthenticated, location.pathname, navigate])

  // Si debe cambiar clave, forzar pantalla de cambio
  if (isAuthenticated && user?.debeCambiarClave && location.pathname !== '/cambiar-clave') {
    return <CambiarClave />
  }

  return <>{children}</>
}
