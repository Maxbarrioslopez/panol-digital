import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { History, ArrowLeftRight, Filter } from 'lucide-react'

export function MovimientosStockPage() {
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [filtroInsumo, setFiltroInsumo] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [insumos, setInsumos] = useState<any[]>([])

  useEffect(() => {
    cargar()
    api.get('/api/insumos').then((r) => setInsumos(r.data.data || []))
  }, [])

  const cargar = async () => {
    try {
      const params: any = {}
      if (filtroInsumo) params.insumoId = filtroInsumo
      if (filtroTipo) params.tipo = filtroTipo
      const res = await api.get('/api/stock/movimientos', { params })
      setMovimientos(res.data.data || [])
    } catch (err) {
      toast.error('Error al cargar movimientos')
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA_COMPRA': return 'bg-green-500/10 text-green-500'
      case 'SALIDA_ENTREGA': return 'bg-blue-500/10 text-blue-500'
      case 'DEVOLUCION': return 'bg-amber-500/10 text-amber-500'
      case 'AJUSTE_MANUAL': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Historial de movimientos</h2>
      </div>

      <div className="flex gap-2">
        <select value={filtroInsumo} onChange={(e) => setFiltroInsumo(e.target.value)} className="flex h-10 rounded-md border px-3 py-2 text-sm">
          <option value="">Todos los insumos</option>
          {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
        </select>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="flex h-10 rounded-md border px-3 py-2 text-sm">
          <option value="">Todos los tipos</option>
          <option value="ENTRADA_COMPRA">Entrada compra</option>
          <option value="SALIDA_ENTREGA">Salida entrega</option>
          <option value="DEVOLUCION">Devolución</option>
          <option value="AJUSTE_MANUAL">Ajuste manual</option>
        </select>
        <button onClick={cargar} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Filter className="mr-2 h-4 w-4" /> Filtrar
        </button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movimientos.map((m) => (
                <tr key={m.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3 text-muted-foreground">{new Date(m.fechaMovimiento).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoColor(m.tipo)}`}>{m.tipo.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{m.insumo?.nombre}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={m.cantidad > 0 ? 'text-green-600' : 'text-red-600'}>
                      {m.cantidad > 0 ? '+' : ''}{m.cantidad}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.usuario?.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.observacion}</td>
                </tr>
              ))}
              {movimientos.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No hay movimientos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
