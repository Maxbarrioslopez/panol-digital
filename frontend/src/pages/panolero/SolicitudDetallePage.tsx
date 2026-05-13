import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toast } from 'sonner'
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react'

export function SolicitudDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [motivoAnulacion, setMotivoAnulacion] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargar()
  }, [id])

  const cargar = async () => {
    try {
      const res = await api.get(`/api/solicitudes/${id}`)
      setSolicitud(res.data.data)
      setItems(res.data.data.detalles.map((d: any) => ({ ...d, accion: 'entregar', motivo: '', cantidadEntregada: d.cantidadSolicitada })))
    } catch (err) {
      toast.error('Error al cargar solicitud')
    }
  }

  const handleProcesar = async () => {
    setLoading(true)
    try {
      await api.put(`/api/solicitudes/${id}/procesar`, {
        items: items.map((i) => ({
          detalleId: i.id,
          accion: i.accion,
          cantidadEntregada: i.cantidadEntregada,
          motivo: i.motivo,
          justificacion: i.justificacion,
        })),
      })
      toast.success('Solicitud procesada')
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al procesar')
    } finally {
      setLoading(false)
    }
  }

  const handleEntregar = async () => {
    setLoading(true)
    try {
      await api.put(`/api/solicitudes/${id}/entregar`)
      toast.success('Solicitud marcada como entregada')
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al entregar')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (detalleId: number, updates: any) => {
    setItems(items.map((i) => i.id === detalleId ? { ...i, ...updates } : i))
  }

  if (!solicitud) return <div className="text-center p-8">Cargando...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button onClick={() => navigate('/panolero')} className="text-sm text-primary flex items-center">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </button>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Solicitud #{solicitud.id}</h2>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${solicitud.estado === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-500' : ''}`}>
            {solicitud.estado.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Trabajador:</span> {solicitud.trabajador?.nombre}</div>
          <div><span className="text-muted-foreground">OT:</span> {solicitud.ot?.codigo}</div>
          <div><span className="text-muted-foreground">Proceso:</span> {solicitud.proceso?.nombre}</div>
          <div><span className="text-muted-foreground">Fecha:</span> {new Date(solicitud.fechaSolicitud).toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Insumos solicitados</h3>
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{item.insumo?.nombre}</p>
                <p className="text-xs text-muted-foreground">Solicitado: {item.cantidadSolicitada} | Stock: {item.insumo?.stockActual}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.accion !== 'anular' && (
                  <>
                    <input
                      type="number"
                      value={item.cantidadEntregada}
                      onChange={(e) => updateItem(item.id, { cantidadEntregada: Number(e.target.value) })}
                      className="w-20 h-8 rounded border px-2 text-sm"
                      min={0}
                    />
                    <button
                      onClick={() => updateItem(item.id, { accion: 'anular', cantidadEntregada: 0 })}
                      className="h-8 w-8 rounded border flex items-center justify-center text-destructive hover:bg-destructive/10"
                      title="Anular"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
                {item.accion === 'anular' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Motivo"
                      value={item.motivo}
                      onChange={(e) => updateItem(item.id, { motivo: e.target.value })}
                      className="w-32 h-8 rounded border px-2 text-sm"
                    />
                    <button
                      onClick={() => updateItem(item.id, { accion: 'entregar', cantidadEntregada: item.cantidadSolicitada })}
                      className="h-8 w-8 rounded border flex items-center justify-center text-green-600 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {item.accion === 'anular' && !item.motivo && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Motivo obligatorio
              </p>
            )}
          </div>
        ))}
      </div>

      {solicitud.estado === 'PENDIENTE' || solicitud.estado === 'PARCIAL' ? (
        <button
          onClick={handleProcesar}
          disabled={loading || items.some((i) => i.accion === 'anular' && !i.motivo)}
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Guardar y preparar'}
        </button>
      ) : solicitud.estado === 'LISTA_PARA_RETIRO' ? (
        <button
          onClick={handleEntregar}
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Entregando...' : 'Confirmar entrega física'}
        </button>
      ) : null}
    </div>
  )
}
