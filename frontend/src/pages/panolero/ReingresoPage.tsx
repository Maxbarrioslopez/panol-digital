import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'

export function ReingresoPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [solicitudId, setSolicitudId] = useState<number | null>(null)
  const [detalles, setDetalles] = useState<any[]>([])
  const [devoluciones, setDevoluciones] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/solicitudes').then((r) => setSolicitudes(r.data.data || []))
  }, [])

  useEffect(() => {
    if (solicitudId) {
      const s = solicitudes.find((x) => x.id === solicitudId)
      if (s) {
        setDetalles(s.detalles.filter((d: any) => d.estadoLinea === 'ENTREGADO' || d.estadoLinea === 'DEVUELTO_PARCIAL'))
        setDevoluciones(s.detalles.map((d: any) => ({
          detalleId: d.id,
          insumoId: d.insumoId,
          nombre: d.insumo?.nombre,
          cantidadMaxima: Number(d.cantidadEntregada || 0) - Number(d.cantidadDevuelta || 0),
          cantidad: 0,
          estadoInsumo: 'BUENO',
        })).filter((d: any) => d.cantidadMaxima > 0))
      }
    }
  }, [solicitudId, solicitudes])

  const handleDevolver = async () => {
    const validas = devoluciones.filter((d) => d.cantidad > 0)
    if (validas.length === 0) {
      toast.error('Selecciona al menos un insumo para devolver')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/devoluciones', {
        solicitudId,
        trabajadorId: solicitudes.find((s) => s.id === solicitudId)?.trabajadorId,
        detalles: validas.map((d) => ({
          insumoId: d.insumoId,
          cantidadDevuelta: d.cantidad,
          estadoInsumo: d.estadoInsumo,
        })),
      })
      toast.success('Devolución registrada')
      setSolicitudId(null)
      setDevoluciones([])
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al registrar devolución')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Reingreso / Devolución</h2>
      </div>

      {!solicitudId ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Selecciona una solicitud entregada</p>
          {solicitudes.filter((s) => s.estado === 'COMPLETADA' || s.estado === 'ENTREGADA').map((s) => (
            <button
              key={s.id}
              onClick={() => setSolicitudId(s.id)}
              className="w-full text-left rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <p className="font-medium">Solicitud #{s.id}</p>
              <p className="text-sm text-muted-foreground">{s.trabajador?.nombre} | OT: {s.ot?.codigo}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setSolicitudId(null)} className="text-sm text-primary">← Volver</button>
          <div className="space-y-2">
            {devoluciones.map((d, idx) => (
              <div key={d.insumoId} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{d.nombre}</p>
                  <span className="text-xs text-muted-foreground">Máx: {d.cantidadMaxima}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0}
                    max={d.cantidadMaxima}
                    value={d.cantidad}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), d.cantidadMaxima)
                      setDevoluciones(devoluciones.map((x, i) => i === idx ? { ...x, cantidad: val } : x))
                    }}
                    className="w-24 h-8 rounded border px-2 text-sm"
                  />
                  <select
                    value={d.estadoInsumo}
                    onChange={(e) => setDevoluciones(devoluciones.map((x, i) => i === idx ? { ...x, estadoInsumo: e.target.value } : x))}
                    className="h-8 rounded border px-2 text-sm"
                  >
                    <option value="BUENO">Bueno</option>
                    <option value="DANADO">Dañado</option>
                    <option value="CUARENTENA">Cuarentena</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleDevolver}
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Registrar devolución'}
          </button>
        </div>
      )}
    </div>
  )
}
