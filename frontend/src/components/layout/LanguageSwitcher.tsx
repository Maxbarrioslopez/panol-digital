import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../../store/uiStore'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useThemeStore()

  const toggle = () => {
    const next = language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
    setLanguage(next)
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Globe className="h-5 w-5" />
      <span className="ml-1 text-xs hidden md:inline">{language.toUpperCase()}</span>
    </button>
  )
}
