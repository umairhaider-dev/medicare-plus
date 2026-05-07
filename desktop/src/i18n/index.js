import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ar from './locales/ar.json'

const savedLang = localStorage.getItem('dpmc-lang') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

// Apply dir attribute immediately on load (before React renders)
document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr')
document.documentElement.setAttribute('lang', savedLang)

export function setLanguage(lang) {
  i18n.changeLanguage(lang)
  localStorage.setItem('dpmc-lang', lang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', lang)
}

export default i18n
