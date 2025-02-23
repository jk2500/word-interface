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