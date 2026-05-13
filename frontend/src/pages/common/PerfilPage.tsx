import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { toast } from 'sonner'
import { User, Save, Key } from 'lucide-react'

export function PerfilPage() {
  const { user, setAuth } = useAuthStore()
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ nombre: user.nombre || '', email: user.email || '', telefono: '' })
    }
  }, [user])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/api/usuarios/${user?.id}`, form)
      toast.success('Perfil actualizado')
      const me = await api.get('/api/auth/me')
      setAuth(me.data.data, useAuthStore.getState().token!, useAuthStore.getState().refreshToken!)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Mi perfil</h2>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {user?.nombre?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-lg font-medium">{user?.nombre}</p>
            <p className="text-sm text-muted-foreground">{user?.rol} • {user?.rut}</p>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Teléfono</label>
            <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <div className="border-t pt-4">
          <button onClick={() => window.location.href = '/cambiar-clave'} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            <Key className="mr-2 h-4 w-4" /> Cambiar clave
          </button>
        </div>
      </div>
    </div>
  )
}
