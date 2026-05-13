import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { ShoppingCart, Package, DollarSign, Check } from 'lucide-react'

export function RecepcionComprasPage() {
  const [compras, setCompras] = useState<any[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [compraId, setCompraId] = useState<number | null>(null)
  const [form, setForm] = useState({ cantidadRecibida: 0, costoUnitario: 0, observacion: '' })

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/compras')
      setCompras(res.data.data?.filter((c: any) => c.estado === 'AUTORIZADA') || [])
    } catch (err) {
      toast.error('Error al cargar compras')
    }
  }

  const handleRecepcionar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!compraId) return
    try {
      await api.put(`/api/compras/${compraId}/recepcionar`, form)
      toast.success('Recepción registrada')
      setModalAbierto(false)
      setCompraId(null)
      setForm({ cantidadRecibida: 0, costoUnitario: 0, observacion: '' })
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Recepción de compras</h2>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-right">Solicitado</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Fecha autorización</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compras.map((c) => (
                <tr key={c.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3">#{c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.insumo?.nombre}</td>
                  <td className="px-4 py-3 text-right">{c.cantidadSolicitada}</td>
                  <td className="px-4 py-3">{c.proveedorSugerido || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.fechaAutorizacion).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setCompraId(c.id); setForm({ cantidadRecibida: c.cantidadSolicitada, costoUnitario: 0, observacion: '' }); setModalAbierto(true) }}
                      className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Check className="mr-1 h-3 w-3" /> Recepcionar
                    </button>
                  </td>
                </tr>
              ))}
              {compras.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No hay compras autorizadas pendientes de recepción</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">Recepcionar compra #{compraId}</h3>
            <form onSubmit={handleRecepcionar} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Cantidad recibida</label>
                <input type="number" value={form.cantidadRecibida} onChange={(e) => setForm({ ...form, cantidadRecibida: Number(e.target.value) })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Costo unitario nuevo</label>
                <input type="number" value={form.costoUnitario} onChange={(e) => setForm({ ...form, costoUnitario: Number(e.target.value) })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" placeholder="Opcional - actualiza el costo del insumo" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Observación</label>
                <textarea value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[60px]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Confirmar recepción</button>
                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
