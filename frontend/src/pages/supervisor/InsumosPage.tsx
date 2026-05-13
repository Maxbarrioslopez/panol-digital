import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Insumo {
  id: number
  codigoInterno: string
  nombre: string
  categoria: string
  stockActual: number
  stockMinimo: number
  tipoInsumo: string
  activo: boolean
}

export function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Insumo | null>(null)
  const [form, setForm] = useState({ codigoInterno: '', nombre: '', descripcion: '', categoriaId: 1, unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', stockMinimo: 0 })

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const [i, c] = await Promise.all([api.get('/api/insumos'), api.get('/api/categorias')])
      setInsumos(i.data.data || [])
      setCategorias(c.data.data || [])
    } catch (err) {
      toast.error('Error al cargar insumos')
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/api/insumos/${editando.id}`, form)
        toast.success('Insumo actualizado')
      } else {
        await api.post('/api/insumos', form)
        toast.success('Insumo creado')
      }
      setModalAbierto(false)
      setEditando(null)
      setForm({ codigoInterno: '', nombre: '', descripcion: '', categoriaId: 1, unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', stockMinimo: 0 })
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    }
  }

  const handleDesactivar = async (id: number) => {
    if (!confirm('¿Desactivar este insumo?')) return
    try {
      await api.delete(`/api/insumos/${id}`)
      toast.success('Insumo desactivado')
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const filtrados = insumos.filter((i) =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.codigoInterno.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gestión de insumos</h2>
        </div>
        <button
          onClick={() => { setEditando(null); setForm({ codigoInterno: '', nombre: '', descripcion: '', categoriaId: categorias[0]?.id || 1, unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', stockMinimo: 0 }); setModalAbierto(true) }}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo insumo
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
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtrados.map((i) => (
                <tr key={i.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3 font-mono text-xs">{i.codigoInterno}</td>
                  <td className="px-4 py-3 font-medium">{i.nombre}</td>
                  <td className="px-4 py-3">{i.categoria}</td>
                  <td className="px-4 py-3">
                    <span className={i.stockActual <= i.stockMinimo ? 'text-red-500 font-medium' : ''}>
                      {i.stockActual}
                    </span>
                    <span className="text-muted-foreground text-xs"> / {i.stockMinimo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${i.tipoInsumo === 'CONSUMIBLE' ? 'bg-blue-500/10 text-blue-500' : i.tipoInsumo === 'REUTILIZABLE' ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>
                      {i.tipoInsumo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditando(i); setForm({ codigoInterno: i.codigoInterno, nombre: i.nombre, descripcion: '', categoriaId: 1, unidadMedida: 'unidad', tipoInsumo: i.tipoInsumo, stockMinimo: i.stockMinimo }); setModalAbierto(true) }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDesactivar(i.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No hay insumos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">{editando ? 'Editar insumo' : 'Nuevo insumo'}</h3>
            <form onSubmit={handleGuardar} className="space-y-3">
              <input type="text" value={form.codigoInterno} onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })} placeholder="Código interno" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[60px]" />
              <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm">
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <select value={form.tipoInsumo} onChange={(e) => setForm({ ...form, tipoInsumo: e.target.value })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm">
                <option value="CONSUMIBLE">Consumible</option>
                <option value="REUTILIZABLE">Reutilizable</option>
                <option value="EQUIPO">Equipo</option>
              </select>
              <input type="number" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} placeholder="Stock mínimo" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
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
