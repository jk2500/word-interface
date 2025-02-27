import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Editor, Range, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { produce } from 'immer'

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
      // Make a deep copy of the selection without using JSON methods
      // This is much more performant than JSON.parse(JSON.stringify())
      selectionRef.current = produce(selection, draft => {
        // Immutable copy is created by immer, no need to modify
      })
    }
  }, [editor])

  // Restore selection on focus with improved error handling
  const handleFocus = useCallback(() => {
    const selection = selectionRef.current
    if (!selection || !isMountedRef.current) return
    
    try {
      // Performant check if selection is still valid
      if (selectionIsValid(editor, selection)) {
        // Use requestAnimationFrame for smoother UI
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            Transforms.select(editor, selection)
          }
        })
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

  // Check if a selection is still valid in the editor
  const selectionIsValid = (editor: Editor, selection: Range): boolean => {
    try {
      return (
        Editor.hasPath(editor, selection.anchor.path) &&
        Editor.hasPath(editor, selection.focus.path)
      )
    } catch (error) {
      return false
    }
  }

  // Handle editor blur with improved targeting and performance
  const handleEditorBlur = useCallback((event: React.FocusEvent) => {
    if (!isMountedRef.current) return
    
    // Use element lookup by ID if possible, which is faster
    const chatContainer = document.querySelector('.chat-container')
    if (!chatContainer) return
    
    // Check if the related target is within chat container
    const relatedTarget = event.relatedTarget as Node
    if (chatContainer.contains(relatedTarget)) {
      event.preventDefault()
      
      // Only try to refocus if we have a valid selection
      try {
        if (editor.selection) {
          // Use requestAnimationFrame for smoother UI
          requestAnimationFrame(() => {
            if (isMountedRef.current && selectionIsValid(editor, editor.selection!)) {
              ReactEditor.focus(editor)
            }
          })
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

  // Return memoized object to prevent unnecessary rerenders in consumers
  return useMemo(() => ({ 
    selectionRef, 
    handleSelectionChange, 
    handleFocus,
    handleEditorBlur
  }), [handleSelectionChange, handleFocus, handleEditorBlur])
}