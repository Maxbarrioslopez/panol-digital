import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { Factory, Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react'

interface Proceso {
  id: number
  nombre: string
  orden: number
  activo: boolean
  subprocesos: any[]
}

export function ProcesosPage() {
  const [procesos, setProcesos] = useState<Proceso[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Proceso | null>(null)
  const [form, setForm] = useState({ nombre: '', orden: 0 })
  const [expandido, setExpandido] = useState<number | null>(null)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/procesos/procesos')
      setProcesos(res.data.data || [])
    } catch (err) {
      toast.error('Error al cargar procesos')
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/api/procesos/${editando.id}`, form)
        toast.success('Proceso actualizado')
      } else {
        await api.post('/api/procesos', form)
        toast.success('Proceso creado')
      }
      setModalAbierto(false)
      setEditando(null)
      setForm({ nombre: '', orden: 0 })
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    }
  }

  const filtrados = procesos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Factory className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Procesos de reparación</h2>
        </div>
        <button onClick={() => { setEditando(null); setForm({ nombre: '', orden: 0 }); setModalAbierto(true) }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nuevo proceso
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        {filtrados.map((p) => (
          <div key={p.id} className="rounded-lg border bg-card">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setExpandido(expandido === p.id ? null : p.id)} className="text-muted-foreground hover:text-foreground">
                  {expandido === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <span className="text-sm text-muted-foreground w-6">{p.orden}</span>
                <span className="font-medium">{p.nombre}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditando(p); setForm({ nombre: p.nombre, orden: p.orden }); setModalAbierto(true) }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
              </div>
            </div>
            {expandido === p.id && p.subprocesos && (
              <div className="px-4 pb-4 pl-12">
                <p className="text-sm text-muted-foreground mb-2">Subprocesos:</p>
                <div className="space-y-1">
                  {p.subprocesos.map((s: any) => (
                    <div key={s.id} className="text-sm flex items-center gap-2">
                      <span className="text-muted-foreground">{s.orden}.</span> {s.nombre}
                    </div>
                  ))}
                  {(!p.subprocesos || p.subprocesos.length === 0) && <p className="text-sm text-muted-foreground">Sin subprocesos</p>}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtrados.length === 0 && <div className="text-center text-muted-foreground py-8">No hay procesos</div>}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">{editando ? 'Editar proceso' : 'Nuevo proceso'}</h3>
            <form onSubmit={handleGuardar} className="space-y-3">
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del proceso" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} placeholder="Orden" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
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
