import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { ClipboardList, Plus, Pencil, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react'

interface OT {
  id: number
  codigo: string
  descripcion: string
  estado: string
  estadoEquipo: string
  presupuestoEstimado: number
  fechaInicio: string
  activo: boolean
}

export function OrdenesTrabajoPage() {
  const [ots, setOts] = useState<OT[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<OT | null>(null)
  const [form, setForm] = useState({ codigo: '', descripcion: '', estado: 'ACTIVA', estadoEquipo: '', presupuestoEstimado: 0, fechaInicio: '' })

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/ordenes-trabajo')
      setOts(res.data.data || [])
    } catch (err) {
      toast.error('Error al cargar OTs')
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/api/ordenes-trabajo/${editando.id}`, form)
        toast.success('OT actualizada')
      } else {
        await api.post('/api/ordenes-trabajo', form)
        toast.success('OT creada')
      }
      setModalAbierto(false)
      setEditando(null)
      setForm({ codigo: '', descripcion: '', estado: 'ACTIVA', estadoEquipo: '', presupuestoEstimado: 0, fechaInicio: '' })
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    }
  }

  const handleCerrar = async (id: number) => {
    if (!confirm('¿Cerrar esta orden de trabajo?')) return
    try {
      await api.put(`/api/ordenes-trabajo/${id}`, { estado: 'CERRADA' })
      toast.success('OT cerrada')
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const filtrados = ots.filter((o) =>
    o.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    o.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Órdenes de trabajo</h2>
        </div>
        <button onClick={() => { setEditando(null); setForm({ codigo: '', descripcion: '', estado: 'ACTIVA', estadoEquipo: '', presupuestoEstimado: 0, fechaInicio: new Date().toISOString().split('T')[0] }); setModalAbierto(true) }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nueva OT
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por código o descripción..." className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm" />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Presupuesto</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtrados.map((o) => (
                <tr key={o.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{o.codigo}</td>
                  <td className="px-4 py-3">{o.descripcion}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.estado === 'ACTIVA' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {o.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">${Number(o.presupuestoEstimado || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditando(o); setForm({ codigo: o.codigo, descripcion: o.descripcion, estado: o.estado, estadoEquipo: o.estadoEquipo || '', presupuestoEstimado: Number(o.presupuestoEstimado || 0), fechaInicio: o.fechaInicio ? o.fechaInicio.split('T')[0] : '' }); setModalAbierto(true) }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    {o.estado === 'ACTIVA' && (
                      <button onClick={() => handleCerrar(o.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-green-50 text-green-600" title="Cerrar OT"><CheckCircle2 className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay órdenes de trabajo</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">{editando ? 'Editar OT' : 'Nueva orden de trabajo'}</h3>
            <form onSubmit={handleGuardar} className="space-y-3">
              <input type="text" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Código (ej: OT-2026-005)" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[60px]" required />
              <input type="text" value={form.estadoEquipo} onChange={(e) => setForm({ ...form, estadoEquipo: e.target.value })} placeholder="Estado del equipo" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
              <input type="number" value={form.presupuestoEstimado} onChange={(e) => setForm({ ...form, presupuestoEstimado: Number(e.target.value) })} placeholder="Presupuesto estimado" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
              <input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
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
