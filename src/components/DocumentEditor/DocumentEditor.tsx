import React, { useMemo, useState, useCallback } from 'react'
import { createEditor, Descendant, Editor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { Toolbar } from './Toolbar'
import { EditorContainer } from '../../styles/editor.styles'
import { StorageService } from '../../services/storage'
import { CustomElement } from '../../types/editor'
import { debounce } from 'lodash'

export const DocumentEditor: React.FC = () => {
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

  // Debounce the save operation
  const debouncedSave = useMemo(
    () => debounce((content: Descendant[], font: string, formats: any) => {
      StorageService.saveDocument(content as CustomElement[], font, formats)
    }, 300),
    []
  )

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue)
    debouncedSave(newValue, currentFont, formats)
  }, [currentFont, formats, debouncedSave])

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

  return (
    <EditorContainer>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
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
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Start typing..."
          style={{ 
            fontFamily: getCurrentFont() || 'inherit',
            // Add a min-height to ensure placeholder is visible
            minHeight: '100%'
          }}
        />
      </Slate>
    </EditorContainer>
  )
} 