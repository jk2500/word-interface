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

// Batch storage operations
const debouncedSave = debounce((state: EditorState) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EDITOR_STATE, JSON.stringify(state))
  } catch (error) {
    console.error('Error saving editor state:', error)
  }
}, 500) // Reduced from 1000ms to 500ms for better responsiveness

// Cache the last loaded state
let cachedState: EditorState | null = null

export const StorageService = {
  saveEditorState: (state: EditorState) => {
    cachedState = state // Update cache
    debouncedSave(state)
  },

  loadEditorState: (): EditorState => {
    if (cachedState) return cachedState // Use cache if available

    try {
      const state = localStorage.getItem(STORAGE_KEYS.EDITOR_STATE)
      if (!state) return {
        content: INITIAL_EDITOR_VALUE,
        isDark: false,
        currentFont: ''
      }

      const parsedState = JSON.parse(state)
      cachedState = {
        content: isValidSlateContent(parsedState.content) ? parsedState.content : INITIAL_EDITOR_VALUE,
        isDark: Boolean(parsedState.isDark),
        currentFont: String(parsedState.currentFont || '')
      }
      return cachedState
    } catch (error) {
      console.error('Error loading editor state:', error)
      return {
        content: INITIAL_EDITOR_VALUE,
        isDark: false,
        currentFont: ''
      }
    }
  },

  saveDocument: (content: Descendant[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_STATE, JSON.stringify(content))
    } catch (error) {
      console.error('Error saving document:', error)
    }
  },

  loadDocument: (): Descendant[] => {
    try {
      const content = localStorage.getItem(STORAGE_KEYS.EDITOR_STATE)
      if (!content) return INITIAL_EDITOR_VALUE

      const parsedContent = JSON.parse(content)
      return isValidSlateContent(parsedContent) ? parsedContent : INITIAL_EDITOR_VALUE
    } catch (error) {
      console.error('Error loading document:', error)
      return INITIAL_EDITOR_VALUE
    }
  }
} 