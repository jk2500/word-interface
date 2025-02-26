import { useState, useCallback } from 'react'
import { Editor } from 'slate'

/**
 * Custom hook to manage editor formatting
 */
export function useEditorFormats(editor: Editor) {
  const [formats, setFormats] = useState(editor.currentFormats)
  const [currentFont, setCurrentFont] = useState(editor.currentFont)
  
  /**
   * Toggle a text format (bold, italic, underline)
   */
  const toggleFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const isActive = isFormatActive(format)
    Editor.addMark(editor, format, !isActive)
    
    // Update format state
    editor.currentFormats[format] = !isActive
    setFormats({ ...editor.currentFormats })
  }, [editor])

  /**
   * Check if a format is currently active
   */
  const isFormatActive = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : editor.currentFormats[format]
  }, [editor])

  /**
   * Set the current font
   */
  const toggleFont = useCallback((font: string) => {
    setCurrentFont(font)
    Editor.addMark(editor, 'font', font)
  }, [])

  /**
   * Get the current font
   */
  const getCurrentFont = useCallback(() => {
    return currentFont || Editor.marks(editor)?.font || ''
  }, [currentFont, editor])

  return {
    formats,
    currentFont,
    toggleFormat,
    isFormatActive,
    toggleFont,
    getCurrentFont
  }
}