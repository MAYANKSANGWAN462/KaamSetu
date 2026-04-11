// frontend/src/context/LanguageContext.jsx
import { createContext, useContext } from 'react'

export const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  // Return a safe fallback t() so nothing crashes
  if (!context) {
    return { t: (key) => '', language: 'en', changeLanguage: () => {} }
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  return (
    <LanguageContext.Provider value={{
      language: 'en',
      changeLanguage: () => {},
      t: () => '',
      languages: []
    }}>
      {children}
    </LanguageContext.Provider>
  )
}