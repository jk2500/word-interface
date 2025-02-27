import { useCallback, useEffect, useState } from 'react'
import { Editor, Transforms, Range, Point } from 'slate'
import { useDocumentContext } from '../contexts/DocumentContext'
import { findAndReplaceText, getCurrentParagraphText } from '../utils/editor'

/**
 * Custom hook to handle editor commands (like text replacement and insertion)
 */
export function useEditorCommands(editor: Editor) {
  const { updateContext } = useDocumentContext()
  const [isStreaming, setIsStreaming] = useState(false)
  
  /**
   * Handle text replacement command
   */
  const handleEditCommand = useCallback((oldText: string, newText: string) => {
    const wasReplaced = findAndReplaceText(editor, oldText, newText)
    
    if (wasReplaced) {
      updateContext({
        type: 'CONTENT_CHANGE',
        context: {
          currentParagraph: getCurrentParagraphText(editor),
          fullContent: JSON.stringify(editor.children)
        }
      })
    }
    
    return wasReplaced
  }, [editor, updateContext])
  
  /**
   * Handle text insertion command at current cursor position
   * Simple version with minimal processing
   */
  const handleWriteCommand = useCallback((content: string) => {
    if (!content) return false
    
    try {
      // If there's a selection, replace it
      if (editor.selection && !Range.isCollapsed(editor.selection)) {
        Transforms.delete(editor)
      }
      
      // Ensure we have a valid selection point
      if (!editor.selection) {
        // Make sure the editor has content before trying to get the end point
        if (editor.children.length === 0) {
          // Insert an empty paragraph if the editor is empty
          Transforms.insertNodes(editor, {
            type: 'paragraph',
            children: [{ text: '' }]
          })
        }
        
        // Now we can safely get the end point
        const lastNodePath = Editor.end(editor, [])
        Transforms.select(editor, lastNodePath)
      }
      
      // Simply insert the text at the current selection
      Transforms.insertText(editor, content)
      
      // Update document context only once after all text is inserted
      setTimeout(() => {
        updateContext({
          type: 'CONTENT_CHANGE',
          context: {
            currentParagraph: getCurrentParagraphText(editor),
            fullContent: JSON.stringify(editor.children)
          }
        })
      }, 100)
      
      return true
    } catch (error) {
      console.error('Error in handleWriteCommand:', error)
      return false
    }
  }, [editor, updateContext])
  
  // Set up event listeners for commands
  useEffect(() => {
    const handleEditEvent = (event: CustomEvent) => {
      const { oldText, newText } = event.detail
      if (oldText && newText) {
        handleEditCommand(oldText, newText)
      }
    }
    
    const handleWriteEvent = (event: CustomEvent) => {
      const { content } = event.detail
      if (content) {
        // Set streaming flag to true while we're processing
        setIsStreaming(true)
        
        // Wait for the next tick to ensure all content is received
        setTimeout(() => {
          const contentToInsert = String(content).trim()
          if (contentToInsert) {
            handleWriteCommand(contentToInsert)
          }
          // Reset streaming flag when done
          setIsStreaming(false)
        }, 100)
      }
    }
    
    document.addEventListener('editCommand', handleEditEvent as EventListener)
    document.addEventListener('writeCommand', handleWriteEvent as EventListener)
    
    return () => {
      document.removeEventListener('editCommand', handleEditEvent as EventListener)
      document.removeEventListener('writeCommand', handleWriteEvent as EventListener)
    }
  }, [handleEditCommand, handleWriteCommand])
  
  return { 
    handleEditCommand,
    handleWriteCommand,
    isStreaming
  }
}