import { useState, useCallback, useMemo } from 'react'
import { Editor } from 'slate'

/**
 * Custom hook to manage editor formatting with optimized state updates
 */
export function useEditorFormats(editor: Editor) {
  const [formats, setFormats] = useState(editor.currentFormats)
  const [currentFont, setCurrentFont] = useState(editor.currentFont)
  
  /**
   * Toggle a text format (bold, italic, underline) with efficient updates
   */
  const toggleFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const isActive = isFormatActive(format)
    Editor.addMark(editor, format, !isActive)
    
    // Only update changed property instead of entire object
    setFormats(prevFormats => {
      // Use functional update to avoid stale state closure issues
      if (prevFormats[format] === !isActive) return prevFormats
      
      // Create new object only if value actually changed
      return {
        ...prevFormats,
        [format]: !isActive
      }
    })
    
    // Update editor's copy of formats
    editor.currentFormats[format] = !isActive
  }, [editor])

  /**
   * Check if a format is currently active with memoized lookups
   */
  const isFormatActive = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : editor.currentFormats[format]
  }, [editor])

  /**
   * Set the current font with null checks and equality check
   */
  const toggleFont = useCallback((font: string) => {
    if (!font || font === currentFont) return
    
    setCurrentFont(font)
    Editor.addMark(editor, 'font', font)
  }, [currentFont, editor])

  /**
   * Get the current font with memoized value
   */
  const getCurrentFont = useCallback(() => {
    return currentFont || Editor.marks(editor)?.font || ''
  }, [currentFont, editor])

  /**
   * Create memoized return value to prevent unnecessary rerenders
   */
  return useMemo(() => ({
    formats,
    currentFont,
    toggleFormat,
    isFormatActive,
    toggleFont,
    getCurrentFont
  }), [formats, currentFont, toggleFormat, isFormatActive, toggleFont, getCurrentFont])
}