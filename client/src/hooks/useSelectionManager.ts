import { useRef, useCallback, useEffect } from 'react'
import { Editor, Range, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'

/**
 * Custom hook to manage editor selection state with improved performance
 */
export function useSelectionManager(editor: Editor) {
  // Ref to store the current selection
  const selectionRef = useRef<Range | null>(null)
  
  // Throttle selection updates to avoid excessive processing
  const lastSelectionChangeTime = useRef(0)
  const THROTTLE_MS = 100 // Only process selection changes every 100ms max
  
  // Track if the component is mounted to prevent updates after unmount
  const isMountedRef = useRef(true)

  // Handle selection changes with throttling for better performance
  const handleSelectionChange = useCallback(() => {
    // Skip excessive updates
    const now = Date.now()
    if (now - lastSelectionChangeTime.current < THROTTLE_MS) {
      return
    }
    lastSelectionChangeTime.current = now
    
    // Only process if component is still mounted
    if (!isMountedRef.current) return
    
    const { selection } = editor
    if (selection && !Range.isCollapsed(selection)) {
      // Store a deep copy of the selection to avoid reference issues
      selectionRef.current = JSON.parse(JSON.stringify(selection))
    }
  }, [editor])

  // Restore selection on focus with improved error handling
  const handleFocus = useCallback(() => {
    if (!selectionRef.current || !isMountedRef.current) return
    
    try {
      // Check if the selection point is valid before trying to restore it
      const isValidPoint = Editor.hasPath(editor, selectionRef.current.anchor.path) &&
                        Editor.hasPath(editor, selectionRef.current.focus.path)
      
      if (isValidPoint) {
        Transforms.select(editor, selectionRef.current)
      } else {
        selectionRef.current = null
      }
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to restore selection:', error)
      }
      selectionRef.current = null
    }
  }, [editor])

  // Handle editor blur with improved targeting
  const handleEditorBlur = useCallback((event: React.FocusEvent) => {
    if (!isMountedRef.current) return
    
    // More efficient selector
    const chatContainer = document.querySelector('.chat-container')
    if (!chatContainer) return
    
    // Check if the new focus target is within the chat interface
    if (chatContainer.contains(event.relatedTarget as Node)) {
      event.preventDefault()
      
      // Only try to refocus if we have a valid selection
      try {
        if (editor.selection && Editor.hasPath(editor, editor.selection.anchor.path)) {
          ReactEditor.focus(editor)
        }
      } catch (error) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to maintain focus:', error)
        }
      }
    }
  }, [editor])

  // Set up selection change event listener with proper cleanup
  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true
    
    // Use passive event listener for better performance
    document.addEventListener('selectionchange', handleSelectionChange, { passive: true })
    
    // Proper cleanup
    return () => {
      isMountedRef.current = false
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])

  return { 
    selectionRef, 
    handleSelectionChange, 
    handleFocus,
    handleEditorBlur
  }
}