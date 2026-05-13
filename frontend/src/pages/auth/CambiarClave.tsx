import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { toast } from 'sonner'
import { Lock, ArrowLeft } from 'lucide-react'

export function CambiarClave() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const [claveActual, setClaveActual] = useState('')
  const [claveNueva, setClaveNueva] = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (claveNueva !== confirmarClave) {
      toast.error(t('passwordMismatch', { ns: 'auth' }))
      return
    }
    const regex = /^[A-Z]\d{4}$/
    if (!regex.test(claveNueva)) {
      toast.error(t('invalidFormat', { ns: 'auth' }))
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/cambiar-clave', { claveActual, claveNueva })
      toast.success('Clave actualizada exitosamente')
      logout()
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al cambiar clave')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Lock className="h-8 w-8 mx-auto text-primary mb-2" />
          <h1 className="text-2xl font-bold">{t('changePasswordTitle', { ns: 'auth' })}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('currentPassword', { ns: 'auth' })}</label>
            <input
              type="password"
              value={claveActual}
              onChange={(e) => setClaveActual(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('newPassword', { ns: 'auth' })}</label>
            <input
              type="password"
              value={claveNueva}
              onChange={(e) => setClaveNueva(e.target.value)}
              placeholder="Ej: A1234"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">{t('passwordHint', { ns: 'auth' })}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('confirmNewPassword', { ns: 'auth' })}</label>
            <input
              type="password"
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? t('loading') : t('save')}
          </button>
        </form>
      </div>
    </div>
  )
}
