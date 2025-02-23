import { Descendant, Element } from 'slate'
import { INITIAL_EDITOR_VALUE } from '../constants/editor'
import { debounce } from 'lodash'

interface EditorState {
  content: Descendant[]
  isDark: boolean
  currentFont: string
}

const STORAGE_KEYS = {
  EDITOR_STATE: 'editor_state',
}

// Validate if the content has the correct structure
const isValidSlateContent = (content: any): content is Descendant[] => {
  return Array.isArray(content) && 
    content.every(node => 
      Element.isElement(node) && 
      node.type === 'paragraph' && 
      Array.isArray(node.children)
    )
}

interface EditorState {
  content: Descendant[]
  currentFont: string
  formats: {
    bold: boolean
    italic: boolean
    underline: boolean
  }
  isDark: boolean
}

export const StorageService = {
  saveDocument: (content: Descendant[], font: string, formats: EditorState['formats']) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENT_CONTENT, JSON.stringify({
        content,
        currentFont: font,
        formats,
      }))
    } catch (error) {
      console.error('Error saving document:', error)
    }
  },

  saveTheme: (isDark: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify({ isDark }))
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  },

  loadDocument: (): Omit<EditorState, 'isDark'> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENT_CONTENT)
      if (!data) return {
        content: INITIAL_EDITOR_VALUE,
        currentFont: '',
        formats: { bold: false, italic: false, underline: false }
      }

      const parsedData = JSON.parse(data)
      return {
        content: isValidSlateContent(parsedData.content) ? parsedData.content : INITIAL_EDITOR_VALUE,
        currentFont: parsedData.currentFont || '',
        formats: parsedData.formats || { bold: false, italic: false, underline: false }
      }
    } catch (error) {
      console.error('Error loading document:', error)
      return {
        content: INITIAL_EDITOR_VALUE,
        currentFont: '',
        formats: { bold: false, italic: false, underline: false }
      }
    }
  },

  loadTheme: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME)
      if (!data) return false
      return JSON.parse(data).isDark
    } catch {
      return false
    }
  }
} 