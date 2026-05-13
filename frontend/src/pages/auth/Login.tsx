import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { toast } from 'sonner'
import { Eye, EyeOff, Factory, User, HardHat, Warehouse, ClipboardCheck, Settings } from 'lucide-react'

const CUENTAS_RAPIDAS = [
  { rut: '1-9', clave: 'A1234', nombre: 'Admin', rol: 'Superusuario', icon: Settings, color: 'bg-purple-500 hover:bg-purple-600' },
  { rut: '12345678-9', clave: 'B5678', nombre: 'Juan Pérez', rol: 'Supervisor', icon: ClipboardCheck, color: 'bg-blue-500 hover:bg-blue-600' },
  { rut: '11111111-1', clave: 'C9012', nombre: 'Ana López', rol: 'Pañolero', icon: Warehouse, color: 'bg-amber-500 hover:bg-amber-600' },
  { rut: '22222222-2', clave: 'D3456', nombre: 'Pedro Gómez', rol: 'Trabajador', icon: HardHat, color: 'bg-green-500 hover:bg-green-600' },
  { rut: '33333333-3', clave: 'E7890', nombre: 'María Ruiz', rol: 'Oficina Técnica', icon: User, color: 'bg-pink-500 hover:bg-pink-600' },
]

export function Login() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [rut, setRut] = useState('')
  const [clave, setClave] = useState('')
  const [showClave, setShowClave] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(rut, clave)
  }

  const login = async (r: string, c: string) => {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { rut: r, clave: c })
      const { usuario, accessToken, refreshToken } = res.data.data
      setAuth(usuario, accessToken, refreshToken)
      toast.success(`Bienvenido, ${usuario.nombre}`)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-primary p-3 rounded-xl">
            <Factory className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('appName')}</h1>
          <p className="text-muted-foreground text-sm">{t('loginSubtitle', { ns: 'auth' })}</p>
        </div>

        {/* Cuentas de acceso rápido */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Acceso rápido para pruebas</p>
          <div className="grid grid-cols-1 gap-2">
            {CUENTAS_RAPIDAS.map((c) => (
              <button
                key={c.rut}
                onClick={() => login(c.rut, c.clave)}
                disabled={loading}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-all ${c.color} disabled:opacity-50`}
              >
                <c.icon className="h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.nombre}</p>
                  <p className="text-xs opacity-90">{c.rol} • {c.rut}</p>
                </div>
                <span className="text-xs font-mono opacity-75">{c.clave}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O ingresa manualmente</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('rut')}</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder={t('rutPlaceholder', { ns: 'auth' })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('password')}</label>
            <div className="relative">
              <input
                type={showClave ? 'text' : 'password'}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder={t('passwordPlaceholder', { ns: 'auth' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowClave(!showClave)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t('passwordHint', { ns: 'auth' })}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? t('loading') : t('loginButton', { ns: 'auth' })}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/recuperar-clave')}
              className="text-sm text-primary hover:underline"
            >
              {t('forgotPassword', { ns: 'auth' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
