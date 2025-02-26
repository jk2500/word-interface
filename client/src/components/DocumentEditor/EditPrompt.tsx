import React, { useState, useRef, useEffect } from 'react'
import { Editor, Range, Transforms } from 'slate'
import { 
  EditPromptOverlay, 
  EditPromptContainer, 
  EditPromptHeader,
  SelectedTextPreview,
  EditPromptInput,
  EditPromptButtons
} from '../../styles/editor.styles'
import { AIService } from '../../services/ai'

interface EditPromptProps {
  selectedText: string
  onClose: () => void
  editor: Editor
  selection: Range | null
}

export const EditPrompt: React.FC<EditPromptProps> = ({ 
  selectedText, 
  onClose, 
  editor, 
  selection 
}) => {
  const [instruction, setInstruction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Focus the input when the prompt opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instruction.trim() || !selection) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Get the edited text from the AI
      const editedText = await AIService.getEditing(selectedText, instruction)
      
      // Apply the edit to the document
      if (editor.selection) {
        Transforms.select(editor, selection)
        Transforms.delete(editor)
        Transforms.insertText(editor, editedText)
      }
      
      // Close the prompt
      onClose()
    } catch (err) {
      console.error('Error getting AI edit:', err)
      setError('Failed to get AI response. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <EditPromptOverlay onClick={onClose}>
      <EditPromptContainer onClick={(e) => e.stopPropagation()}>
        <EditPromptHeader>
          <h3>Edit with AI</h3>
          <button onClick={onClose}>&times;</button>
        </EditPromptHeader>
        
        <SelectedTextPreview>
          {selectedText.length > 200 
            ? selectedText.substring(0, 200) + '...' 
            : selectedText}
        </SelectedTextPreview>
        
        <form onSubmit={handleSubmit}>
          <EditPromptInput
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter instructions for editing this text..."
            aria-label="Edit instructions"
          />
          
          {error && <p style={{ color: 'red', margin: '0 0 10px' }}>{error}</p>}
          
          <EditPromptButtons>
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit" 
              disabled={!instruction.trim() || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Apply Edit'}
            </button>
          </EditPromptButtons>
        </form>
      </EditPromptContainer>
    </EditPromptOverlay>
  )
}

export default EditPrompt