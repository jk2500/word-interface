import type { Theme as EmotionTheme } from '@emotion/react'

export const THEMES = {
  light: {
    background: '#f6f8fa',
    paper: '#ffffff',
    border: '#e1e4e8',
    text: '#24292e',
    textSecondary: '#6a737d',
    placeholder: '#a0aec0',
    primary: '#0366d6',
    hover: '#f6f8fa',
    active: '#f1f8ff',
    shadow: 'rgba(0, 0, 0, 0.1)',
    divider: '#f1f3f5'
  },
  dark: {
    background: '#1a1b1e',
    paper: '#2d2d2d',
    border: '#404040',
    text: '#e1e4e8',
    textSecondary: '#959da5',
    placeholder: '#6a737d',
    primary: '#58a6ff',
    hover: '#363636',
    active: '#2f3342',
    shadow: 'rgba(0, 0, 0, 0.3)',
    divider: '#404040'
  }
} satisfies Record<string, EmotionTheme> 