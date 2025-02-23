import { Descendant, Element } from 'slate'
import { STORAGE_KEYS } from '../constants/storage'
import { INITIAL_EDITOR_VALUE } from '../constants/editor'

// Validate if the content has the correct structure
const isValidSlateContent = (content: any): content is Descendant[] => {
  return Array.isArray(content) && 
    content.every(node => 
      Element.isElement(node) && 
      node.type === 'paragraph' && 
      Array.isArray(node.children)
    )
}

export const StorageService = {
  saveDocument: (content: Descendant[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENT_CONTENT, JSON.stringify(content))
    } catch (error) {
      console.error('Error saving document:', error)
    }
  },

  loadDocument: (): Descendant[] => {
    try {
      const content = localStorage.getItem(STORAGE_KEYS.DOCUMENT_CONTENT)
      if (!content) return INITIAL_EDITOR_VALUE

      const parsedContent = JSON.parse(content)
      return isValidSlateContent(parsedContent) ? parsedContent : INITIAL_EDITOR_VALUE
    } catch (error) {
      console.error('Error loading document:', error)
      return INITIAL_EDITOR_VALUE
    }
  }
} 