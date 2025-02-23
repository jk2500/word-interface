import '@emotion/react'

// Define the base theme structure
interface ThemeColors {
  background: string
  paper: string
  border: string
  text: string
  textSecondary: string
  placeholder: string
  primary: string
  hover: string
  active: string
  shadow: string
  divider: string
}

declare module '@emotion/react' {
  export interface Theme extends ThemeColors {}
} 