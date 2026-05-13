import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { toast } from 'sonner'
import { ClipboardList, Package, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react'

export function DashboardTrabajador() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [pendientes, setPendientes] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, completadas: 0, pendientes: 0, entregadas: 0 })
  const [ultimas, setUltimas] = useState<any[]>([])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resPendientes, resSolicitudes] = await Promise.all([
        api.get('/api/solicitudes/pendientes-recepcion'),
        api.get('/api/solicitudes'),
      ])
      setPendientes(resPendientes.data.data || [])
      const solicitudes = resSolicitudes.data.data || []
      setStats({
        total: solicitudes.length,
        completadas: solicitudes.filter((s: any) => s.estado === 'COMPLETADA').length,
        pendientes: solicitudes.filter((s: any) => s.estado === 'PENDIENTE').length,
        entregadas: solicitudes.filter((s: any) => s.estado === 'ENTREGADA').length,
      })
      setUltimas(solicitudes.slice(0, 5))
    } catch (err) {
      console.error(err)
    }
  }

  const confirmarRecepcion = async (id: number) => {
    try {
      await api.put(`/api/solicitudes/${id}/confirmar-recepcion`)
      toast.success('Recepción confirmada')
      cargarDatos()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al confirmar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bienvenido, {user?.nombre}</h2>
        <button
          onClick={() => navigate('/trabajador/nueva-solicitud')}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva solicitud
        </button>
      </div>

      {pendientes.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
            <AlertTriangle className="h-5 w-5" />
            Tienes {pendientes.length} recepción(es) pendiente(s)
          </div>
          <div className="space-y-2">
            {pendientes.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-background rounded p-3">
                <div>
                  <p className="font-medium">Solicitud #{s.id}</p>
                  <p className="text-sm text-muted-foreground">OT: {s.ot?.codigo}</p>
                </div>
                <button
                  onClick={() => confirmarRecepcion(s.id)}
                  className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                >
                  Confirmar recepción
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total solicitudes</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold">{stats.completadas}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{stats.pendientes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Package className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Por confirmar</p>
              <p className="text-2xl font-bold">{stats.entregadas}</p>
            </div>
          </div>
        </div>
      </div>

      {ultimas.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Últimas solicitudes</h3>
            <button onClick={() => navigate('/trabajador/mis-solicitudes')} className="text-sm text-primary hover:underline">Ver todas</button>
          </div>
          <div className="divide-y">
            {ultimas.map((s) => (
              <div key={s.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Solicitud #{s.id}</p>
                  <p className="text-sm text-muted-foreground">OT: {s.ot?.codigo} | {s.proceso?.nombre}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.estado === 'COMPLETADA' ? 'bg-green-500/10 text-green-500' :
                  s.estado === 'ENTREGADA' ? 'bg-purple-500/10 text-purple-500' :
                  s.estado === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {s.estado.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
