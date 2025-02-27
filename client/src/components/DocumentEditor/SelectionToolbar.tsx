import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Editor, Range, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { FloatingToolbar, ToolbarButton } from '../../styles/editor.styles'
import { EditPrompt } from './EditPrompt'

interface SelectionToolbarProps {
  editor: Editor
  selection: Range | null
}

const DISABLE_NEWLINE_HANDLING = true;

export const SelectionToolbar: React.FC<SelectionToolbarProps> = React.memo(({ editor, selection }) => {
  const [position, setPosition] = useState({ top: -9999, left: -9999 })
  const [isVisible, setIsVisible] = useState(false)
  const [showEditPrompt, setShowEditPrompt] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)
  
  // Throttle toolbar positioning updates
  const lastUpdateTime = useRef(0)
  const THROTTLE_MS = 50

  // Update position when selection changes with throttling
  useEffect(() => {
    // Skip if no selection or selection is collapsed
    if (
      !selection ||
      Range.isCollapsed(selection) ||
      !ReactEditor.isFocused(editor)
    ) {
      setIsVisible(false)
      return
    }

    // Throttle updates
    const now = Date.now()
    if (now - lastUpdateTime.current < THROTTLE_MS) {
      // Schedule an update after throttle time elapses
      const timerId = setTimeout(() => {
        updateToolbarPosition()
      }, THROTTLE_MS)
      return () => clearTimeout(timerId)
    }
    
    lastUpdateTime.current = now
    updateToolbarPosition()
  }, [editor, selection])

  // Extract toolbar positioning logic into separate function
  const updateToolbarPosition = () => {
    try {
      const domSelection = window.getSelection()
      if (!domSelection) {
        setIsVisible(false)
        return
      }

      // Get the currently selected text
      const text = Editor.string(editor, selection!)
      setSelectedText(text)

      // Only show if there's actual text selected (not just whitespace)
      if (!text.trim()) {
        setIsVisible(false)
        return
      }

      // Get the range of the selection
      const domRange = domSelection.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()

      // Calculate position above the selection
      const newTop = rect.top - 50
      const newLeft = rect.left + rect.width / 2
      
      // Only update position if it's significantly different
      if (
        Math.abs(position.top - newTop) > 5 ||
        Math.abs(position.left - newLeft) > 5 ||
        !isVisible
      ) {
        setPosition({
          top: newTop,
          left: newLeft,
        })
        setIsVisible(true)
      }
    } catch (error) {
      console.error('Error positioning toolbar:', error)
      setIsVisible(false)
    }
  }

  const handleEditClick = () => {
    setShowEditPrompt(true)
    setIsVisible(false)
  }

  const closeEditPrompt = () => {
    setShowEditPrompt(false)
    setIsVisible(true)
  }

  // Selection restoration with requestAnimationFrame for better performance
  useEffect(() => {
    if (!showEditPrompt && selection && !Range.isCollapsed(selection)) {
      try {
        // Restore selection when prompt closes
        ReactEditor.focus(editor)
        
        // Delay selection restoration to next animation frame for better UI performance
        requestAnimationFrame(() => {
          try {
            // Check if selection is still valid
            if (
              Editor.hasPath(editor, selection.anchor.path) && 
              Editor.hasPath(editor, selection.focus.path)
            ) {
              Transforms.select(editor, selection)
            } else {
              console.warn('Selection is no longer valid, skipping restore')
            }
          } catch (error) {
            console.error('Error in delayed selection restore:', error)
          }
        })
      } catch (error) {
        console.error('Error restoring selection:', error)
      }
    }
  }, [showEditPrompt, editor, selection])

  // Memoize CSS transform to avoid recalculations
  const transformStyle = useMemo(() => ({
    transform: 'translateX(-50%)'
  }), [])

  // Memoize the combined style object
  const toolbarStyle = useMemo(() => ({
    top: `${position.top}px`,
    left: `${position.left}px`,
    ...transformStyle
  }), [position.top, position.left, transformStyle])

  return (
    <>
      <FloatingToolbar
        ref={toolbarRef}
        className={isVisible ? '' : 'hidden'}
        style={toolbarStyle}
      >
        <ToolbarButton onClick={handleEditClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          Edit with AI
        </ToolbarButton>
      </FloatingToolbar>

      {showEditPrompt && (
        <EditPrompt
          selectedText={selectedText}
          onClose={closeEditPrompt}
          editor={editor}
          selection={selection}
        />
      )}
    </>
  )
})

export default SelectionToolbar