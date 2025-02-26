import React, { useState, useEffect, useRef } from 'react'
import { Editor, Range, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { FloatingToolbar, ToolbarButton } from '../../styles/editor.styles'
import { EditPrompt } from './EditPrompt'

interface SelectionToolbarProps {
  editor: Editor
  selection: Range | null
}

const DISABLE_NEWLINE_HANDLING = true; // Temporary flag to disable newline handling

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ editor, selection }) => {
  const [position, setPosition] = useState({ top: -9999, left: -9999 })
  const [isVisible, setIsVisible] = useState(false)
  const [showEditPrompt, setShowEditPrompt] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Update position when selection changes
  useEffect(() => {
    if (
      !selection ||
      Range.isCollapsed(selection) ||
      !ReactEditor.isFocused(editor)
    ) {
      setIsVisible(false)
      return
    }

    try {
      const domSelection = window.getSelection()
      if (!domSelection) {
        setIsVisible(false)
        return
      }

      // Get the currently selected text
      const text = Editor.string(editor, selection)
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
      setPosition({
        top: rect.top - 50,
        left: rect.left + rect.width / 2,
      })

      setIsVisible(true)
    } catch (error) {
      console.error('Error positioning toolbar:', error)
      setIsVisible(false)
    }
  }, [editor, selection])

  const handleEditClick = () => {
    setShowEditPrompt(true)
    setIsVisible(false)
  }

  const closeEditPrompt = () => {
    setShowEditPrompt(false)
    setIsVisible(true)
  }

  // Maintain selection when user opens and closes the prompt
  useEffect(() => {
    if (!showEditPrompt && selection && !Range.isCollapsed(selection)) {
      try {
        // Restore selection when prompt closes
        ReactEditor.focus(editor)
        setTimeout(() => {
          // Check if both anchor and focus paths exist in the current editor state
          if (Editor.hasPath(editor, selection.anchor.path) && Editor.hasPath(editor, selection.focus.path)) {
            Transforms.select(editor, selection)
          } else {
            console.warn('Selection is no longer valid, skipping restore:', selection)
          }
        }, 100)
      } catch (error) {
        console.error('Error restoring selection:', error)
      }
    }
  }, [showEditPrompt, editor, selection])

  const processSelectedText = (text: string) => {
    if (DISABLE_NEWLINE_HANDLING) {
      // Just return the text as-is without any newline processing
      return text;
    }
    
    // Original newline handling code
    const lines = text.split(/\r?\n/);
    // rest of the function...
  }

  return (
    <>
      <FloatingToolbar
        ref={toolbarRef}
        className={isVisible ? '' : 'hidden'}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)',
        }}
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
}

export default SelectionToolbar