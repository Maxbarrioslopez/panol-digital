import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react'

export function MisSolicitudes() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<any[]>([])

  useEffect(() => {
    api.get('/api/solicitudes').then((r) => setSolicitudes(r.data.data || []))
  }, [])

  const getIcon = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'ENTREGADA': return <Package className="h-5 w-5 text-purple-500" />
      case 'PENDIENTE': return <Clock className="h-5 w-5 text-amber-500" />
      case 'ANULADA': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mis solicitudes</h2>
      <div className="space-y-2">
        {solicitudes.map((s) => (
          <div key={s.id} className="rounded-lg border bg-card p-4 flex items-center gap-3">
            {getIcon(s.estado)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Solicitud #{s.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.estado === 'COMPLETADA' ? 'bg-green-500/10 text-green-500' :
                  s.estado === 'ENTREGADA' ? 'bg-purple-500/10 text-purple-500' :
                  s.estado === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {s.estado.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">OT: {s.ot?.codigo} | {s.proceso?.nombre}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(s.fechaSolicitud).toLocaleDateString()}
            </div>
          </div>
        ))}
        {solicitudes.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No tienes solicitudes aún</div>
        )}
      </div>
    </div>
  )
}
