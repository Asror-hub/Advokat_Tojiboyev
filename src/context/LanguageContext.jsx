import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LANGS, translations } from '../i18n/translations'
import { toCyrillic } from '../i18n/translit'

const LanguageContext = createContext(null)

// Uzbek (Cyrillic) is the main language of the site.
const DEFAULT_LANG = 'oz'
// Bumped from the old key so languages saved before Cyrillic became the main
// one no longer override it. A language picked from now on is remembered.
const STORAGE_KEY = 'et-lang-v2'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return LANGS.some((l) => l.id === stored) ? stored : DEFAULT_LANG
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === 'oz' ? 'uz-Cyrl' : lang
    document.title = translations[lang].meta.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', translations[lang].meta.description)
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
      langs: LANGS,
      // Converts fixed Latin strings (brand name etc.) for Uzbek Cyrillic and Russian.
      tr: (text) => (lang === 'oz' || lang === 'ru' ? toCyrillic(text) : text),
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

const MONTHS = {
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  oz: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

export function formatDate(iso, lang) {
  const date = new Date(iso)
  const months = MONTHS[lang] || MONTHS.uz
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
