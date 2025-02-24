import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { createEditor, Descendant, Editor, Range, Transforms } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { Toolbar } from './Toolbar'
import { EditorContainer } from '../../styles/editor.styles'
import { StorageService } from '../../services/storage'
import { CustomElement } from '../../types/editor'
import { debounce } from 'lodash'
import { useDocumentContext } from '../../contexts/DocumentContext'
import { getCurrentParagraph, getCurrentParagraphText, countWords } from '../../utils/editor'

export const DocumentEditor: React.FC = () => {
  const { updateContext } = useDocumentContext()

  const editor = useMemo(() => {
    const e = withReact(createEditor())
    const savedState = StorageService.loadDocument()
    e.currentFont = savedState.currentFont
    e.currentFormats = savedState.formats
    return e
  }, [])

  const [value, setValue] = useState<Descendant[]>(() => {
    return StorageService.loadDocument().content
  })
  
  const [currentFont, setCurrentFont] = useState(editor.currentFont)
  const [formats, setFormats] = useState(editor.currentFormats)

  // Ref to store the current selection
  const selectionRef = useRef<Range | null>(null)

  // Debounce the save operation
  const debouncedSave = useMemo(
    () => debounce((content: Descendant[], font: string, formats: any) => {
      StorageService.saveDocument(content as CustomElement[], font, formats)
    }, 300),
    []
  )

  const handleSelectionChange = useCallback(() => {
    const { selection } = editor
    if (selection && !Range.isCollapsed(selection)) {
      selectionRef.current = selection // Store the current selection
    }
  }, [editor])

  const handleContentChange = useCallback((value: Descendant[]) => {
    setValue(value)
    debouncedSave(value, currentFont, formats)
    
    updateContext({
      type: 'CONTENT_CHANGE',
      context: {
        totalWords: countWords(value),
        currentParagraph: getCurrentParagraphText(editor),
        fullContent: JSON.stringify(value)
      }
    })
  }, [setValue, debouncedSave, currentFont, formats, updateContext, editor])

  // Restore selection when the editor is focused
  const handleFocus = () => {
    if (selectionRef.current) {
      Transforms.select(editor, selectionRef.current) // Restore the selection
    }
  }

  // Add this function to prevent selection loss
  const handleEditorBlur = useCallback((event: React.FocusEvent) => {
    // Check if the new focus target is within the chat interface
    const chatContainer = document.querySelector('.chat-container')
    if (chatContainer?.contains(event.relatedTarget as Node)) {
      // If clicking into chat, prevent the blur and maintain selection
      event.preventDefault()
      // Keep editor in focus
      ReactEditor.focus(editor)
    }
  }, [editor])

  // Memoize render callbacks
  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'paragraph':
        return (
          <p 
            {...props.attributes} 
            style={{ textAlign: props.element.align || 'left' }}
          >
            {props.children}
          </p>
        )
      default:
        return <p {...props.attributes}>{props.children}</p>
    }
  }, [])

  const renderLeaf = useCallback((props: any) => {
    let children = props.children
    const { leaf } = props

    if (leaf.bold) {
      children = <strong>{children}</strong>
    }
    if (leaf.italic) {
      children = <em>{children}</em>
    }
    if (leaf.underline) {
      children = <u>{children}</u>
    }
    if (leaf.font) {
      children = <span style={{ fontFamily: leaf.font }}>{children}</span>
    }

    return <span {...props.attributes}>{children}</span>
  }, [])

  const toggleFormat = (format: 'bold' | 'italic' | 'underline') => {
    const isActive = isFormatActive(format)
    Editor.addMark(editor, format, !isActive)
    
    // Update format state
    editor.currentFormats[format] = !isActive
    setFormats({ ...editor.currentFormats })
  }

  const isFormatActive = (format: 'bold' | 'italic' | 'underline') => {
    // Check both editor marks and our persistent state
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : editor.currentFormats[format]
  }

  // Update toggleFont to maintain font state
  const toggleFont = (font: string) => {
    setCurrentFont(font)
    Editor.addMark(editor, 'font', font)
  }

  // Update getCurrentFont to use state
  const getCurrentFont = () => {
    return currentFont || Editor.marks(editor)?.font || ''
  }

  // Add selection change event listener
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])

  return (
    <EditorContainer>
      <Slate
        editor={editor}
        value={value}
        onChange={handleContentChange}
      >
        <Toolbar 
          onToggleBold={() => toggleFormat('bold')}
          onToggleItalic={() => toggleFormat('italic')}
          onToggleUnderline={() => toggleFormat('underline')}
          isBoldActive={isFormatActive('bold')}
          isItalicActive={isFormatActive('italic')}
          isUnderlineActive={isFormatActive('underline')}
          onFontChange={toggleFont}
          currentFont={getCurrentFont()}
        />
        <Editable
          onFocus={handleFocus}
          onBlur={handleEditorBlur}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Start typing..."
          style={{ 
            fontFamily: getCurrentFont() || 'inherit',
            minHeight: '100%'
          }}
        />
      </Slate>
    </EditorContainer>
  )
} 