import React, { useState, useMemo, useEffect } from 'react'
import { I18nContext } from './i18nContext'
import { translations } from './translations'

function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') || (navigator.language && navigator.language.startsWith('pt') ? 'pt' : 'en')
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch { /* ignore storage errors */ }
  }, [lang])

  const t = useMemo(() => {
    return function t(key) {
      const parts = key.split('.')
      let cur = translations[lang] || translations.en
      for (const p of parts) {
        if (!cur) return key
        cur = cur[p]
      }
      return typeof cur === 'string' ? cur : key
    }
  }, [lang])

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export { I18nProvider }
