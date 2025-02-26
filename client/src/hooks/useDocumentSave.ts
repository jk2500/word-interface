import { useMemo, useRef, useCallback } from 'react'
import { debounce } from 'lodash'
import { Descendant } from 'slate'
import { StorageService } from '../services/storage'
import { MetadataService } from '../services/metadataService'
import { CustomElement } from '../types/editor'

/**
 * Custom hook to handle document saving with debounce and content diff checking
 */
export function useDocumentSave() {
  // Track previous state to avoid unnecessary saves
  const prevSaveRef = useRef<{
    contentHash: string;
    font: string;
    formatsHash: string;
  }>({
    contentHash: '',
    font: '',
    formatsHash: ''
  })
  
  // Actual save implementation
  const saveDocument = useCallback((
    content: Descendant[], 
    font: string, 
    formats: any
  ) => {
    // Generate simple hashes for comparison
    const contentHash = JSON.stringify(content)
    const formatsHash = JSON.stringify(formats)
    
    // Skip save if nothing has changed
    if (
      contentHash === prevSaveRef.current.contentHash &&
      font === prevSaveRef.current.font &&
      formatsHash === prevSaveRef.current.formatsHash
    ) {
      return
    }
    
    // Update tracked state
    prevSaveRef.current = {
      contentHash,
      font,
      formatsHash
    }
    
    // Perform actual save operations
    StorageService.saveDocument(content as CustomElement[], font, formats)
    
    // Batched metadata update
    const metadata = MetadataService.load()
    MetadataService.save({
      title: metadata.title,
      lastModified: Date.now()
    })
  }, [])
  
  // Create debounced save function with longer delay for better performance
  const debouncedSave = useMemo(
    () => debounce(saveDocument, 500),
    [saveDocument]
  )

  return { debouncedSave }
}