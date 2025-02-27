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
  fullDocument: string
  documentTitle: string
  lastEdit: Date | string
  totalWords: number
  currentFormat: {
    isBold: boolean
    isItalic: boolean
    isUnderline: boolean
    font: string
  }
  fullContent?: string
  hasSaved?: boolean
}

// Actions for our reducer
export type ActionType = {
  type: 'SELECTION_CHANGE' | 'CONTENT_CHANGE' | 'TITLE_CHANGE' | 'SAVE_STATE_CHANGE' | 'FORMAT_CHANGE';
  payload: Partial<DocumentContext>;
}

interface TextFormat {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  font: string;
  [key: string]: boolean | string;
} 