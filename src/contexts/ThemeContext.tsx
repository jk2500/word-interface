import React, { createContext, useContext, useState } from 'react'
import type { Theme } from '@emotion/react'
import { THEMES } from '../constants/theme'

type ThemeContextType = {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false)
  const theme = isDark ? THEMES.dark : THEMES.light

  const toggleTheme = () => setIsDark(!isDark)

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