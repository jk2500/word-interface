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
   * Stream text word by word
   */
  const streamTextInsertion = useCallback((content: string, delay = 20) => {
    if (!content) return false
    
    console.log('STREAMING TEXT:', content);
    
    // If there's a selection, replace it
    if (editor.selection && !Range.isCollapsed(editor.selection)) {
      Transforms.delete(editor)
    }
    
    // If there's no selection, set selection at the end
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
    
    setIsStreaming(true)
    
    // Properly clean the content to avoid duplication
    // Remove any problematic duplications that might be present in the input
    const cleanedContent = content.replace(/(.+?)\1+/g, '$1');
    
    // Split content by newlines and handle both \r\n and \n
    const lines = cleanedContent.split(/\r?\n/)
    console.log('SPLIT INTO LINES:', lines);
    
    // Process each line and create an array of tokens (words and spaces)
    const processedLines = lines.map(line => {
      // Match words and spaces separately
      return line.match(/\S+|\s+/g) || []
    })
    
    let currentLineIndex = 0
    let currentTokenIndex = 0
    
    const insertNextToken = () => {
      // Check if we've processed all lines
      if (currentLineIndex >= processedLines.length) {
        setIsStreaming(false)
        updateContext({
          type: 'CONTENT_CHANGE',
          context: {
            currentParagraph: getCurrentParagraphText(editor),
            fullContent: JSON.stringify(editor.children)
          }
        })
        return
      }
      
      const currentLine = processedLines[currentLineIndex]
      
      // Check if we've processed all tokens in the current line
      if (currentTokenIndex >= currentLine.length) {
        // Move to the next line
        currentLineIndex++
        currentTokenIndex = 0
        
        // Insert a new paragraph if we're not at the end
        if (currentLineIndex < processedLines.length) {
          Transforms.insertNodes(editor, {
            type: 'paragraph',
            children: [{ text: '' }]
          })
          
          // Continue with the next line
          setTimeout(insertNextToken, delay)
        } else {
          // We're done with all lines
          setIsStreaming(false)
          updateContext({
            type: 'CONTENT_CHANGE',
            context: {
              currentParagraph: getCurrentParagraphText(editor),
              fullContent: JSON.stringify(editor.children)
            }
          })
        }
        return
      }
      
      // Insert the current token
      const token = currentLine[currentTokenIndex]
      console.log('INSERTING TOKEN:', token);
      Transforms.insertText(editor, token)
      currentTokenIndex++
      
      // Schedule the next token insertion
      setTimeout(insertNextToken, delay)
    }
    
    // Start the insertion process
    insertNextToken()
    return true
  }, [editor, updateContext])
  
  /**
   * Handle text insertion command at current cursor position
   */
  const handleWriteCommand = useCallback((content: string, stream = true) => {
    if (!content) return false
    
    if (stream) {
      return streamTextInsertion(content)
    }
    
    // If not streaming, insert text at once
    // If there's a selection, replace it
    if (editor.selection && !Range.isCollapsed(editor.selection)) {
      Transforms.delete(editor)
    }
    
    // Insert the text at current selection or at the end if no selection
    if (editor.selection) {
      Transforms.insertText(editor, content)
    } else {
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
      Transforms.insertText(editor, content)
    }
    
    // Update document context
    updateContext({
      type: 'CONTENT_CHANGE',
      context: {
        currentParagraph: getCurrentParagraphText(editor),
        fullContent: JSON.stringify(editor.children)
      }
    })
    
    return true
  }, [editor, updateContext, streamTextInsertion])
  
  // Set up event listeners for commands
  useEffect(() => {
    const handleEditEvent = (event: CustomEvent) => {
      const { oldText, newText } = event.detail
      if (oldText && newText) {
        handleEditCommand(oldText, newText)
      }
    }
    
    const handleWriteEvent = (event: CustomEvent) => {
      // Check if document length exceeds limit
      if (JSON.stringify(editor.children).length <= 1000) {
        const { content } = event.detail
        console.log('WRITE COMMAND RECEIVED:', content)
        
        // Before inserting the content
        console.log('DOCUMENT BEFORE INSERTION:', JSON.stringify(editor.children))
        
        if (content) {
          // Ensure content is a string
          const contentToInsert = String(content).trim();
          console.log('CONTENT TO INSERT:', contentToInsert);
          
          // Only proceed if we have actual content
          if (contentToInsert) {
            handleWriteCommand(contentToInsert, true) // Enable streaming by default
          } else {
            console.warn('Empty content received, not inserting');
          }
        }
        
        // After inserting the content
        setTimeout(() => {
          console.log('DOCUMENT AFTER INSERTION:', JSON.stringify(editor.children))
        }, 100); // Small delay to ensure insertion has completed
      } else {
        console.log('DOCUMENT TOO LARGE:', JSON.stringify(editor.children).length);
        // Optionally, show a notification to the user that the document is too large
        // You could dispatch a custom event or update the UI directly
      }
    }
    
    document.addEventListener('editCommand', handleEditEvent as EventListener)
    document.addEventListener('writeCommand', handleWriteEvent as EventListener)
    
    return () => {
      document.removeEventListener('editCommand', handleEditEvent as EventListener)
      document.removeEventListener('writeCommand', handleWriteEvent as EventListener)
    }
  }, [handleEditCommand, handleWriteCommand, editor])
  
  return { 
    handleEditCommand, 
    handleWriteCommand,
    isStreaming
  }
}