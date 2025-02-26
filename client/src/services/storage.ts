import { CustomElement } from '../types/editor'
import { DocumentState, STORAGE_KEYS, DEFAULT_DOCUMENT_STATE } from '../types/storage'
import { MetadataService } from './metadataService'

export const StorageService = {
  // Chat methods
  saveMessages(messages: any[]) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  },

  getMessages(): any[] {
    const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    return stored ? JSON.parse(stored) : []
  },

  // Document methods
  saveDocument(content: CustomElement[], font: string, formats: any) {
    const state: DocumentState = {
      content,
      currentFont: font,
      formats
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENT, JSON.stringify(state))
    // Note: we're explicitly handling metadata separately to avoid title resets
  },

  loadDocument(): DocumentState {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENT)
    return stored ? JSON.parse(stored) : DEFAULT_DOCUMENT_STATE
  },

  // Theme methods
  saveTheme(isDark: boolean) {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify({ isDark }))
  },

  loadTheme(): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    return stored ? JSON.parse(stored).isDark : false
  }
} 