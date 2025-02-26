import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { DocumentContext, DocumentContextUpdate } from '../types/document'
import { MetadataService } from '../services/metadataService'

const initialContext: DocumentContext = {
  selectedText: '',
  currentParagraph: '',
  fullDocument: '',
  documentTitle: MetadataService.load().title,
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

// Separate selectors for consuming only specific parts of context
export const useDocumentTitle = () => {
  const { documentContext } = useContext(DocumentContextContext)
  return documentContext.documentTitle
}

export const useDocumentFormat = () => {
  const { documentContext } = useContext(DocumentContextContext)
  return documentContext.currentFormat
}

export const useDocumentSelection = () => {
  const { documentContext } = useContext(DocumentContextContext)
  return {
    selectedText: documentContext.selectedText,
    currentParagraph: documentContext.currentParagraph
  }
}

export const DocumentContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documentContext, dispatch] = useReducer(
    (state: DocumentContext, update: DocumentContextUpdate) => {
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('DocumentContext - Update Type:', update.type)
      }
      
      switch (update.type) {
        case 'SELECTION_CHANGE': {
          // Only update if selection actually changed
          const newSelection = update.context.selectedText
          if (newSelection === state.selectedText) {
            return state // No change, return same state to prevent re-renders
          }
          return { ...state, ...update.context }
        }
        case 'CONTENT_CHANGE': {
          const newState = { 
            ...state, 
            ...update.context,
            lastEdit: new Date()
          }
          return newState
        }
        case 'FORMAT_CHANGE': {
          // Only update if format actually changed
          const currentFormat = state.currentFormat
          const newFormat = update.context.currentFormat
          
          if (
            newFormat && 
            currentFormat.isBold === newFormat.isBold &&
            currentFormat.isItalic === newFormat.isItalic &&
            currentFormat.isUnderline === newFormat.isUnderline &&
            currentFormat.font === newFormat.font
          ) {
            return state // No change, return same state to prevent re-renders
          }
          
          return {
            ...state,
            currentFormat: {
              ...currentFormat,
              ...newFormat
            }
          }
        }
        case 'EDIT_TEXT': {
          return { 
            ...state, 
            ...update.context,
            lastEdit: new Date()
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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    documentContext,
    updateContext
  }), [documentContext, updateContext])

  return (
    <DocumentContextContext.Provider value={contextValue}>
      {children}
    </DocumentContextContext.Provider>
  )
} 