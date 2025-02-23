export interface DocumentMetadata {
  id: string
  title: string
  createdAt: number
  lastModified: number
  version: number
}

export interface DocumentHistory {
  timestamp: number
  content: string  // Serialized document state
}

export interface UnsavedChanges {
  hasChanges: boolean
  lastSaved: number
}

export interface DocumentState {
  metadata: DocumentMetadata
  history: DocumentHistory[]
  unsavedChanges: UnsavedChanges
}

export interface DocumentContext {
  selectedText: string
  currentParagraph: string
  documentTitle: string
  lastEdit: Date
  totalWords: number
  currentFormat: {
    isBold: boolean
    isItalic: boolean
    isUnderline: boolean
    font: string
  }
}

export interface DocumentContextUpdate {
  type: 'SELECTION_CHANGE' | 'CONTENT_CHANGE' | 'FORMAT_CHANGE'
  context: Partial<DocumentContext>
} 