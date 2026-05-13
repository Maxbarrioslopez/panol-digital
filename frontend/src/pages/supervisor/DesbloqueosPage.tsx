import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { Unlock, AlertTriangle } from 'lucide-react'

interface Bloqueado {
  id: number
  nombre: string
  rut: string
  solicitudId: number
  otCodigo: string
  fechaEntrega: string
}

export function DesbloqueosPage() {
  const [bloqueados, setBloqueados] = useState<Bloqueado[]>([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/solicitudes')
      const solicitudes = res.data.data || []
      const entregadas = solicitudes.filter((s: any) => s.estado === 'ENTREGADA')
      setBloqueados(entregadas.map((s: any) => ({
        id: s.trabajador?.id,
        nombre: s.trabajador?.nombre,
        rut: s.trabajador?.rut,
        solicitudId: s.id,
        otCodigo: s.ot?.codigo,
        fechaEntrega: s.fechaEntrega,
      })).filter((b: any) => b.id))
    } catch (err) {
      toast.error('Error al cargar')
    }
  }

  const handleDesbloquear = async (solicitudId: number) => {
    if (!confirm('¿Forzar confirmación de recepción? Esto desbloqueará al trabajador.')) return
    try {
      await api.put(`/api/solicitudes/${solicitudId}/confirmar-recepcion`)
      toast.success('Trabajador desbloqueado')
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al desbloquear')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Unlock className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Desbloqueo de trabajadores</h2>
      </div>

      {bloqueados.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          No hay trabajadores bloqueados
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y">
            {bloqueados.map((b) => (
              <div key={b.solicitudId} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.nombre}</p>
                  <p className="text-sm text-muted-foreground">{b.rut} | OT: {b.otCodigo}</p>
                  <p className="text-xs text-muted-foreground">Entregado: {new Date(b.fechaEntrega).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleDesbloquear(b.solicitudId)}
                  className="inline-flex items-center justify-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                >
                  <Unlock className="mr-1 h-3 w-3" /> Desbloquear
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
