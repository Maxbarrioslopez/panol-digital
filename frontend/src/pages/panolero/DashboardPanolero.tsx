import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toast } from 'sonner'
import { ClipboardList, Package, CheckCircle, Clock, AlertTriangle, RotateCcw } from 'lucide-react'

export function DashboardPanolero() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [stats, setStats] = useState({ pendiente: 0, lista: 0, entregada: 0, disputa: 0, completadaHoy: 0 })

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/solicitudes')
      const data = res.data.data || []
      const hoy = new Date().toISOString().split('T')[0]
      setSolicitudes(data)
      setStats({
        pendiente: data.filter((s: any) => s.estado === 'PENDIENTE').length,
        lista: data.filter((s: any) => s.estado === 'LISTA_PARA_RETIRO').length,
        entregada: data.filter((s: any) => s.estado === 'ENTREGADA').length,
        disputa: data.filter((s: any) => s.estado === 'EN_DISPUTA').length,
        completadaHoy: data.filter((s: any) => s.estado === 'COMPLETADA' && s.fechaCierre?.startsWith(hoy)).length,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-amber-500/10 text-amber-500'
      case 'LISTA_PARA_RETIRO': return 'bg-blue-500/10 text-blue-500'
      case 'ENTREGADA': return 'bg-purple-500/10 text-purple-500'
      case 'COMPLETADA': return 'bg-green-500/10 text-green-500'
      case 'ANULADA': return 'bg-red-500/10 text-red-500'
      case 'EN_DISPUTA': return 'bg-orange-500/10 text-orange-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE' || s.estado === 'PARCIAL')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Panel del pañolero</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-muted-foreground">Pendientes</span>
          </div>
          <p className="text-2xl font-bold">{stats.pendiente}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Listas</span>
          </div>
          <p className="text-2xl font-bold">{stats.lista}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Entregadas</span>
          </div>
          <p className="text-2xl font-bold">{stats.entregada}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Completadas hoy</span>
          </div>
          <p className="text-2xl font-bold">{stats.completadaHoy}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">Disputas</span>
          </div>
          <p className="text-2xl font-bold">{stats.disputa}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => navigate('/panolero/reingreso')} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
          <RotateCcw className="mr-2 h-4 w-4" /> Reingreso
        </button>
        <button onClick={() => navigate('/panolero/historial-devoluciones')} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
          <Clock className="mr-2 h-4 w-4" /> Historial
        </button>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Cola de solicitudes pendientes</h3>
        </div>
        <div className="divide-y">
          {pendientes.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/panolero/solicitud/${s.id}`)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEstadoColor(s.estado)}`}>
                    {s.estado.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-muted-foreground">#{s.id}</span>
                </div>
                <p className="font-medium mt-1">{s.trabajador?.nombre}</p>
                <p className="text-sm text-muted-foreground">OT: {s.ot?.codigo} | {s.proceso?.nombre}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(s.fechaSolicitud).toLocaleDateString()}
              </div>
            </div>
          ))}
          {pendientes.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No hay solicitudes pendientes</div>
          )}
        </div>
      </div>
    </div>
  )
}
