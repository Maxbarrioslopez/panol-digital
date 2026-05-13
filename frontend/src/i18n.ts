import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import esCommon from '../public/locales/es/common.json'
import esAuth from '../public/locales/es/auth.json'
import esErrors from '../public/locales/es/errors.json'

import enCommon from '../public/locales/en/common.json'
import enAuth from '../public/locales/en/auth.json'
import enErrors from '../public/locales/en/errors.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { common: esCommon, auth: esAuth, errors: esErrors },
      en: { common: enCommon, auth: enAuth, errors: enErrors },
    },
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    ns: ['common', 'auth', 'errors'],
    defaultNS: 'common',
  })

export default i18n
