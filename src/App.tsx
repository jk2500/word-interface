import React from 'react'
import { DocumentEditor } from './components/DocumentEditor/DocumentEditor'
import { AppContainer } from './styles/app.styles'

const App: React.FC = () => {
  return (
    <AppContainer>
      <DocumentEditor />
    </AppContainer>
  )
}

export default App
