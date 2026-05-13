import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toast } from 'sonner'
import { Mail, ArrowLeft } from 'lucide-react'

export function RecuperarClave() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/recuperar-clave', { email })
      setEnviado(true)
      toast.success('Si el email existe, se enviarán instrucciones')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al solicitar recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('recoverTitle', { ns: 'auth' })}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t('recoverSubtitle', { ns: 'auth' })}</p>
        </div>

        {enviado ? (
          <div className="rounded-lg border bg-card p-6 text-center space-y-4">
            <Mail className="h-12 w-12 mx-auto text-primary" />
            <p className="text-muted-foreground">Revisa tu correo electrónico para continuar</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.cl"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? t('loading') : t('submit')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex w-full items-center justify-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
