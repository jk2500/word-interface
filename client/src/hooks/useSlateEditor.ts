import { createEditor, Descendant, Editor } from 'slate'
import { withReact } from 'slate-react'
import { useState, useMemo, useCallback, useRef } from 'react'
import { CustomElement } from '../types/editor'
import { StorageService } from '../services/storage'

/**
 * Custom hook to manage Slate editor instance and related state
 */
export function useSlateEditor() {
  // Avoid multiple storage reads by using a ref for the initial load
  const initialDocRef = useRef(StorageService.loadDocument())
  
  // Create and configure the editor
  const editor = useMemo(() => {
    const e = withReact(createEditor())
    const savedState = initialDocRef.current
    e.currentFont = savedState.currentFont
    e.currentFormats = savedState.formats
    return e
  }, [])
  
  // Initialize editor value from storage (use ref to avoid duplicate reads)
  const [value, setValue] = useState<Descendant[]>(() => {
    return initialDocRef.current.content
  })
  
  // Track current font and formats with single state object to reduce re-renders
  const [editorState, setEditorState] = useState({
    currentFont: editor.currentFont,
    formats: editor.currentFormats
  })
  
  // Create optimized setter functions that only update what's needed
  const setCurrentFont = useCallback((font: string) => {
    setEditorState(prev => ({
      ...prev,
      currentFont: font
    }))
    // Also update editor property for consistency
    editor.currentFont = font
  }, [editor])
  
  const setFormats = useCallback((newFormats: any) => {
    setEditorState(prev => {
      // Only update if something actually changed
      const hasChanges = Object.keys(newFormats).some(
        key => prev.formats[key as keyof typeof prev.formats] !== newFormats[key as keyof typeof newFormats]
      )
      
      if (!hasChanges) return prev
      
      return {
        ...prev,
        formats: {
          ...prev.formats,
          ...newFormats
        }
      }
    })
    // Also update editor property for consistency
    editor.currentFormats = {
      ...editor.currentFormats,
      ...newFormats
    }
  }, [editor])
  
  // Optimized setValue that prevents unnecessary re-renders
  const setValueOptimized = useCallback((newValue: Descendant[]) => {
    setValue(prevValue => {
      // Only update if there are actual changes
      if (JSON.stringify(prevValue) === JSON.stringify(newValue)) {
        return prevValue
      }
      return newValue
    })
  }, [])

  return {
    editor,
    value,
    setValue: setValueOptimized,
    currentFont: editorState.currentFont,
    setCurrentFont,
    formats: editorState.formats,
    setFormats
  }
}