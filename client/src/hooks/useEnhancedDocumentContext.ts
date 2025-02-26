import { useCallback } from 'react'
import { Descendant, Editor, Path } from 'slate'
import { useDocumentContext } from '../contexts/DocumentContext'
import { countWords, getCurrentParagraphText } from '../utils/editor'

/**
 * Custom hook to provide enhanced document context management
 */
export function useEnhancedDocumentContext() {
  const { documentContext, updateContext } = useDocumentContext()
  
  /**
   * Update document content context
   */
  const updateDocumentContent = useCallback((editor: Editor, value: Descendant[]) => {
    try {
      // Safely get current paragraph text
      let paragraphText = '';
      
      if (editor.selection) {
        try {
          // Validate selection paths before attempting to get paragraph text
          const isValidSelection = editor.selection.anchor.path.every(x => Number.isInteger(x) && x >= 0) &&
            editor.selection.focus.path.every(x => Number.isInteger(x) && x >= 0) &&
            Path.isPath(editor.selection.anchor.path) &&
            Path.isPath(editor.selection.focus.path) &&
            editor.operations.every(op => op.type !== 'set_selection');

          if (isValidSelection) {
            // Check if the paths actually exist in the document
            const anchorNodeExists = Editor.hasPath(editor, editor.selection.anchor.path);
            const focusNodeExists = Editor.hasPath(editor, editor.selection.focus.path);

            if (anchorNodeExists && focusNodeExists) {
              paragraphText = getCurrentParagraphText(editor);
            }
          }
        } catch (error) {
          console.warn('Error validating selection or getting paragraph text:', error);
        }
      }

      updateContext({
        type: 'CONTENT_CHANGE',
        context: {
          totalWords: countWords(value),
          currentParagraph: paragraphText,
          fullContent: JSON.stringify(value)
        }
      })
    } catch (error) {
      console.error('Error updating document content:', error);
      // Provide fallback update without paragraph text
      updateContext({
        type: 'CONTENT_CHANGE',
        context: {
          totalWords: countWords(value),
          currentParagraph: '',
          fullContent: JSON.stringify(value)
        }
      })
    }
  }, [updateContext])
  
  /**
   * Update document selection context
   */
  const updateDocumentSelection = useCallback((selectedText: string) => {
    updateContext({
      type: 'SELECTION_CHANGE',
      context: {
        selectedText
      }
    })
  }, [updateContext])

  /**
   * Update document formatting context
   */
  const updateDocumentFormat = useCallback((format: {
    isBold?: boolean,
    isItalic?: boolean,
    isUnderline?: boolean,
    font?: string
  }) => {
    // Ensure all required properties have default values
    const completeFormat = {
      isBold: format.isBold ?? documentContext.currentFormat.isBold,
      isItalic: format.isItalic ?? documentContext.currentFormat.isItalic,
      isUnderline: format.isUnderline ?? documentContext.currentFormat.isUnderline,
      font: format.font ?? documentContext.currentFormat.font
    }
    
    updateContext({
      type: 'FORMAT_CHANGE',
      context: {
        currentFormat: completeFormat
      }
    })
  }, [updateContext, documentContext.currentFormat])

  return {
    documentContext,
    updateDocumentContent,
    updateDocumentSelection,
    updateDocumentFormat
  }
}