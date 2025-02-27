import { DocumentMetadata } from '../types/document';

/**
 * Service for handling document metadata
 */
export class MetadataService {
  private static readonly STORAGE_KEY = 'document_metadata';

  /**
   * Load metadata from local storage
   */
  static load(): DocumentMetadata {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const parsedData = stored ? JSON.parse(stored) : {};
      
      // Return with default values if data is missing
      return {
        id: parsedData.id || `doc-${Date.now()}`,
        title: parsedData.title || 'Untitled Document',
        createdAt: parsedData.createdAt || Date.now(),
        lastModified: parsedData.lastModified || Date.now(),
        version: parsedData.version || 1
      };
    } catch (error) {
      console.error('Error loading metadata:', error);
      // Return default metadata if there's an error
      return {
        id: `doc-${Date.now()}`,
        title: 'Untitled Document',
        createdAt: Date.now(),
        lastModified: Date.now(),
        version: 1
      };
    }
  }

  /**
   * Save metadata to local storage
   */
  static save(metadata: Partial<DocumentMetadata>): void {
    try {
      const current = this.load();
      const updated = { ...current, ...metadata, lastModified: Date.now() };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }

  /**
   * Update specific metadata fields
   */
  static update(fields: Partial<DocumentMetadata>): void {
    const current = this.load();
    this.save({ ...current, ...fields, lastModified: Date.now() });
  }

  /**
   * Clear all metadata
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}