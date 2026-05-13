import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { RotateCcw, Search } from 'lucide-react'

export function HistorialDevolucionesPage() {
  const [devoluciones, setDevoluciones] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/devoluciones')
      setDevoluciones(res.data.data || [])
    } catch (err) {
      toast.error('Error al cargar devoluciones')
    }
  }

  const filtradas = devoluciones.filter((d) =>
    d.trabajador?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.solicitud?.ot?.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Historial de devoluciones</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por trabajador o OT..." className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm" />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Trabajador</th>
                <th className="px-4 py-3 text-left">OT</th>
                <th className="px-4 py-3 text-left">Pañolero</th>
                <th className="px-4 py-3 text-right">Ítems</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtradas.map((d) => (
                <tr key={d.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3">#{d.id}</td>
                  <td className="px-4 py-3 font-medium">{d.trabajador?.nombre}</td>
                  <td className="px-4 py-3">{d.solicitud?.ot?.codigo}</td>
                  <td className="px-4 py-3">{d.panolero?.nombre}</td>
                  <td className="px-4 py-3 text-right">{d.detalles?.length || 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(d.fechaDevolucion).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtradas.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No hay devoluciones</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
