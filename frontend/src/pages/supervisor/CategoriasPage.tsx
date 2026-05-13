import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { toast } from 'sonner'
import { Tag, Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Categoria {
  id: number
  nombre: string
  descripcion: string
  colorClasificacion: string
  activo: boolean
}

export function CategoriasPage() {
  const { t } = useTranslation()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', colorClasificacion: '#3B82F6' })

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/categorias')
      setCategorias(res.data.data || [])
    } catch (err) {
      toast.error('Error al cargar categorías')
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/api/categorias/${editando.id}`, form)
        toast.success('Categoría actualizada')
      } else {
        await api.post('/api/categorias', form)
        toast.success('Categoría creada')
      }
      setModalAbierto(false)
      setEditando(null)
      setForm({ nombre: '', descripcion: '', colorClasificacion: '#3B82F6' })
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    }
  }

  const handleDesactivar = async (id: number) => {
    if (!confirm('¿Desactivar esta categoría?')) return
    try {
      await api.delete(`/api/categorias/${id}`)
      toast.success('Categoría desactivada')
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const filtrados = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gestión de categorías</h2>
        </div>
        <button onClick={() => { setEditando(null); setForm({ nombre: '', descripcion: '', colorClasificacion: '#3B82F6' }); setModalAbierto(true) }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nueva categoría
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm" />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Color</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3"><div className="h-4 w-4 rounded-full" style={{ backgroundColor: c.colorClasificacion }} /></td>
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.descripcion}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditando(c); setForm({ nombre: c.nombre, descripcion: c.descripcion || '', colorClasificacion: c.colorClasificacion || '#3B82F6' }); setModalAbierto(true) }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDesactivar(c.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No hay categorías</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">{editando ? 'Editar categoría' : 'Nueva categoría'}</h3>
            <form onSubmit={handleGuardar} className="space-y-3">
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[60px]" />
              <div className="flex items-center gap-2">
                <input type="color" value={form.colorClasificacion} onChange={(e) => setForm({ ...form, colorClasificacion: e.target.value })} className="h-10 w-10 rounded border" />
                <span className="text-sm text-muted-foreground">Color de clasificación</span>
              </div>
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
