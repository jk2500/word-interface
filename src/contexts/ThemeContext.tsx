import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Theme } from '@emotion/react'
import { THEMES } from '../constants/theme'
import { StorageService } from '../services/storage'

type ThemeContextType = {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => StorageService.loadTheme())
  const theme = isDark ? THEMES.dark : THEMES.light

  const toggleTheme = useCallback(() => {
    setIsDark((prev: boolean) => {
      const newIsDark = !prev
      StorageService.saveTheme(newIsDark)
      return newIsDark
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
} 