import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { DocumentContext, DocumentContextUpdate } from '../types/document'

const initialContext: DocumentContext = {
  selectedText: '',
  currentParagraph: '',
  fullDocument: '',
  documentTitle: 'Untitled Document',
  lastEdit: new Date(),
  totalWords: 0,
  currentFormat: {
    isBold: false,
    isItalic: false,
    isUnderline: false,
    font: 'Arial'
  }
}

const DocumentContextContext = createContext<{
  documentContext: DocumentContext
  updateContext: (update: DocumentContextUpdate) => void
}>({
  documentContext: initialContext,
  updateContext: () => {}
})

export const useDocumentContext = () => useContext(DocumentContextContext)

export const DocumentContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documentContext, dispatch] = useReducer(
    (state: DocumentContext, update: DocumentContextUpdate) => {
      console.log('DocumentContext - Received Update:', update)
      
      switch (update.type) {
        case 'SELECTION_CHANGE':
          return { ...state, ...update.context }
        case 'CONTENT_CHANGE':
          const newState = { 
            ...state, 
            ...update.context,
            lastEdit: new Date()
          }
          console.log('DocumentContext - New State:', newState)
          return newState
        case 'FORMAT_CHANGE':
          return {
            ...state,
            currentFormat: {
              ...state.currentFormat,
              ...update.context.currentFormat
            }
          }
        default:
          return state
      }
    },
    initialContext
  )

  const updateContext = useCallback((update: DocumentContextUpdate) => {
    dispatch(update)
  }, [])

  return (
    <DocumentContextContext.Provider value={{ documentContext, updateContext }}>
      {children}
    </DocumentContextContext.Provider>
  )
} 