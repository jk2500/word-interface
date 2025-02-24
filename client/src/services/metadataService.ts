import { DocumentMetadata } from '../types/document'
import { STORAGE_KEYS } from '../types/storage'

const DEFAULT_METADATA: DocumentMetadata = {
  id: crypto.randomUUID(),
  title: 'Untitled Document',
  createdAt: Date.now(),
  lastModified: Date.now(),
  version: 1
}

export const MetadataService = {
  save(metadata: Partial<DocumentMetadata>) {
    const currentMetadata = this.load()
    const updatedMetadata = {
      ...currentMetadata,
      ...metadata,
      lastModified: Date.now()
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_METADATA, JSON.stringify(updatedMetadata))
    return updatedMetadata
  },

  load(): DocumentMetadata {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENT_METADATA)
    return stored ? JSON.parse(stored) : DEFAULT_METADATA
  },

  updateLastModified() {
    return this.save({ lastModified: Date.now() })
  }
} 