import { createContext, useContext } from 'react'

const I18nContext = createContext()

function useI18n() {
  return useContext(I18nContext)
}

export { I18nContext, useI18n }
