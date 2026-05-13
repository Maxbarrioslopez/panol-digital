import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function useSocket() {
  const user = useAuthStore((s) => s.user)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socket = io(API_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket conectado:', socket.id)
      // Unirse a salas según rol
      if (user.rolId === 3) socket.emit('join-room', 'panolero')
      if (user.rolId === 2) socket.emit('join-room', 'supervisor')
      if (user.rolId === 4) socket.emit('join-room', 'oficina-tecnica')
      if (user.rolId === 1) socket.emit('join-room', 'superusuario')
      socket.emit('join-room', `trabajador-${user.id}`)
    })

    socket.on('solicitud-creada', (payload: any) => {
      toast.info('Nueva solicitud', {
        description: `Solicitud #${payload.solicitudId} ${payload.esUrgente ? '(URGENTE)' : ''}`,
      })
    })

    socket.on('solicitud-lista', (payload: any) => {
      toast.success('Solicitud lista', {
        description: `La solicitud #${payload.solicitudId} está lista para retiro.`,
      })
    })

    socket.on('solicitud-entregada', (payload: any) => {
      toast.success('Solicitud entregada', {
        description: `La solicitud #${payload.solicitudId} fue entregada.`,
      })
    })

    socket.on('solicitud-completada', (payload: any) => {
      toast.success('Solicitud completada', {
        description: `Solicitud #${payload.solicitudId} completada por el trabajador.`,
      })
    })

    socket.on('solicitud-anulada', (payload: any) => {
      toast.error('Solicitud anulada', {
        description: `Solicitud #${payload.solicitudId} fue anulada. ${payload.motivo || ''}`,
      })
    })

    socket.on('solicitud-disputada', (payload: any) => {
      toast.warning('Solicitud en disputa', {
        description: `Solicitud #${payload.solicitudId}: ${payload.motivo || ''}`,
      })
    })

    socket.on('devolucion-creada', (payload: any) => {
      toast.info('Devolución registrada', {
        description: `Devolución #${payload.devolucionId} de solicitud #${payload.solicitudId}.`,
      })
    })

    socket.on('disconnect', () => {
      console.log('Socket desconectado')
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  return socketRef.current
}
