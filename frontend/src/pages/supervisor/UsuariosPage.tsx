import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { toast } from 'sonner'
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Usuario {
  id: number
  rut: string
  nombre: string
  email: string
  rolId: number
  rol: string
  activo: boolean
  debeCambiarClave: boolean
}

export function UsuariosPage() {
  const { t } = useTranslation()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ rut: '', nombre: '', email: '', rolId: 5, telefono: '' })
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const [u, r] = await Promise.all([api.get('/api/usuarios'), api.get('/api/auth/roles')])
      setUsuarios(u.data.data || [])
      setRoles(r.data.data || [])
    } catch (err) {
      toast.error('Error al cargar usuarios')
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/api/usuarios/${editando.id}`, form)
        toast.success('Usuario actualizado')
      } else {
        await api.post('/api/usuarios', form)
        toast.success('Usuario creado')
      }
      setModalAbierto(false)
      setEditando(null)
      setForm({ rut: '', nombre: '', email: '', rolId: 5, telefono: '' })
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    }
  }

  const handleDesactivar = async (id: number) => {
    if (!confirm('¿Desactivar este usuario?')) return
    try {
      await api.delete(`/api/usuarios/${id}`)
      toast.success('Usuario desactivado')
      cargar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const filtrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rut.includes(busqueda)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gestión de usuarios</h2>
        </div>
        <button
          onClick={() => { setEditando(null); setForm({ rut: '', nombre: '', email: '', rolId: 5, telefono: '' }); setModalAbierto(true) }}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o RUT..."
          className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">RUT</th>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Rol</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3">{u.rut}</td>
                  <td className="px-4 py-3 font-medium">{u.nombre}</td>
                  <td className="px-4 py-3">{u.rol}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditando(u); setForm({ rut: u.rut, nombre: u.nombre, email: u.email || '', rolId: u.rolId, telefono: '' }); setModalAbierto(true) }}
                      className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDesactivar(u.id)}
                      className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">{editando ? 'Editar usuario' : 'Nuevo usuario'}</h3>
            <form onSubmit={handleGuardar} className="space-y-3">
              <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="RUT" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
              <select value={form.rolId} onChange={(e) => setForm({ ...form, rolId: Number(e.target.value) })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm">
                {roles.map((r) => (<option key={r.id} value={r.id}>{r.nombre}</option>))}
              </select>
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
