import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { ShoppingCart, Check, X, AlertTriangle } from 'lucide-react'

interface Compra {
  id: number
  supervisor: string
  insumo: string
  cantidadSolicitada: number
  estado: string
  fechaAutorizacion: string
}

export function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [insumos, setInsumos] = useState<any[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState({ insumoId: 0, cantidadSolicitada: 0, proveedorSugerido: '', observacion: '' })

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const [c, i] = await Promise.all([api.get('/api/compras'), api.get('/api/insumos')])
      setCompras(c.data.data || [])
      setInsumos(i.data.data || [])
    } catch (err) {
      toast.error('Error al cargar compras')
    }
  }

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/compras', form)
      toast.success('Compra autorizada')
      setModalAbierto(false)
      setForm({ insumoId: 0, cantidadSolicitada: 0, proveedorSugerido: '', observacion: '' })
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const handleAutorizar = async (id: number, estado: string) => {
    try {
      await api.put(`/api/compras/${id}/autorizar`, { estado })
      toast.success(`Compra ${estado.toLowerCase()}`)
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Autorización de compras</h2>
        </div>
        <button onClick={() => setModalAbierto(true)} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Check className="mr-2 h-4 w-4" /> Nueva compra
        </button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-left">Cantidad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compras.map((c) => (
                <tr key={c.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3">#{c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.insumo}</td>
                  <td className="px-4 py-3">{c.cantidadSolicitada}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.estado === 'AUTORIZADA' ? 'bg-green-500/10 text-green-500' :
                      c.estado === 'RECHAZADA' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>{c.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.fechaAutorizacion).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {c.estado === 'PENDIENTE' && (
                      <>
                        <button onClick={() => handleAutorizar(c.id, 'AUTORIZADA')} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-green-50 text-green-600"><Check className="h-4 w-4" /></button>
                        <button onClick={() => handleAutorizar(c.id, 'RECHAZADA')} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-50 text-red-600"><X className="h-4 w-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {compras.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No hay compras</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">Nueva compra</h3>
            <form onSubmit={handleCrear} className="space-y-3">
              <select value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: Number(e.target.value) })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required>
                <option value={0}>Seleccionar insumo...</option>
                {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
              <input type="number" value={form.cantidadSolicitada} onChange={(e) => setForm({ ...form, cantidadSolicitada: Number(e.target.value) })} placeholder="Cantidad" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <input type="text" value={form.proveedorSugerido} onChange={(e) => setForm({ ...form, proveedorSugerido: e.target.value })} placeholder="Proveedor sugerido" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
              <textarea value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} placeholder="Observación" className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[60px]" />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Guardar</button>
                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
