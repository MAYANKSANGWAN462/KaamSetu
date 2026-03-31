// Purpose: Provides global language state using API-based translation dictionary with English fallback.
import React, { createContext, useState, useEffect, useContext } from 'react'
import translationService from '../services/translationService'

// Create context
export const LanguageContext = createContext()

// Custom hook for using language
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'bn', name: 'বাংলা' }
]

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'en'
  })
  const [dictionary, setDictionary] = useState({})

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const loadedDictionary = await translationService.getDictionary(language)
        setDictionary(loadedDictionary || {})
      } catch (error) {
        console.error('Failed to load translation dictionary:', error)
        setDictionary({})
      }
    }

    loadDictionary()
  }, [language])

  const changeLanguage = (nextLanguage) => {
    const exists = languages.some((lang) => lang.code === nextLanguage)
    setLanguage(exists ? nextLanguage : 'en')
  }

  const t = (key, variables = {}) => {
    const fallbackLabel = String(key || '')
      .split('.')
      .pop()
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase())

    const template = dictionary[key] || dictionary[`en:${key}`] || fallbackLabel || 'Text'

    return Object.entries(variables).reduce((text, [variable, value]) => {
      const pattern = new RegExp(`{{\\s*${variable}\\s*}}`, 'g')
      return text.replace(pattern, String(value))
    }, template)
  }

  const value = {
    language,
    setLanguage,
    changeLanguage,
    t,
    languages
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}