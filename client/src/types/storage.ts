import { Descendant } from 'slate'

export interface DocumentState {
  content: Descendant[]
  currentFont: string
  formats: {
    bold: boolean
    italic: boolean
    underline: boolean
  }
}

export const STORAGE_KEYS = {
  MESSAGES: 'chat_messages',
  DOCUMENT: 'document_content',
  DOCUMENT_METADATA: 'document_metadata',
  THEME: 'theme_preference'
} as const

export const DEFAULT_DOCUMENT_STATE: DocumentState = {
  content: [{ type: 'paragraph', children: [{ text: '' }] }],
  currentFont: 'Arial',
  formats: {
    bold: false,
    italic: false,
    underline: false
  }
} 