import React, { memo } from 'react'
import { DocumentEditor } from './components/DocumentEditor/DocumentEditor'
import { Chat } from './components/Chat/Chat'
import { AppContainer } from './styles/app.styles'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext'
import { DocumentContextProvider } from './contexts/DocumentContext'

const ThemedApp: React.FC = () => {
  const { theme } = useTheme()
  
  return (
    <EmotionThemeProvider theme={theme}>
      <AppContainer>
        <DocumentEditor />
        <Chat />
      </AppContainer>
    </EmotionThemeProvider>
  )
}

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <DocumentContextProvider>
        <ThemedApp />
      </DocumentContextProvider>
    </CustomThemeProvider>
  )
}

export default App
