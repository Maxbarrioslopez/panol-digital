import { useState } from 'react'
import { useThemeStore } from '../../store/uiStore'
import { toast } from 'sonner'
import { Settings, Save } from 'lucide-react'

export function ConfiguracionPage() {
  const { theme, toggleTheme, language, setLanguage } = useThemeStore()
  const [guardando, setGuardando] = useState(false)

  const handleGuardar = async () => {
    setGuardando(true)
    setTimeout(() => {
      toast.success('Configuración guardada')
      setGuardando(false)
    }, 500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Configuración del sistema</h2>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Apariencia</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-md border ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              Oscuro
            </button>
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-md border ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              Claro
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Idioma</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage('es')}
              className={`px-4 py-2 rounded-md border ${language === 'es' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              Español
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-md border ${language === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              English
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Stock</h3>
          <p className="text-sm text-muted-foreground">Alerta cuando stock actual sea menor o igual al mínimo</p>
        </div>

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
