import React, { useMemo, useState, useCallback } from 'react'
import { createEditor, Descendant, Editor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { Toolbar } from './Toolbar'
import { EditorContainer } from '../../styles/editor.styles'
import { StorageService } from '../../services/storage'

type TextAlign = 'left' | 'center' | 'right' | 'justify'

interface CustomElement {
  type: string
  align?: TextAlign
  children: Descendant[]
}

interface RenderElementProps {
  element: CustomElement
  attributes: Record<string, unknown>
  children: React.ReactNode
}

export const DocumentEditor: React.FC = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const editorState = useMemo(() => StorageService.loadEditorState(), [])
  const [value, setValue] = useState<Descendant[]>(editorState.content)
  const [currentFont, setCurrentFont] = useState(editorState.currentFont)

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue)
    StorageService.saveEditorState({
      ...StorageService.loadEditorState(),
      content: newValue
    })
  }, [])

  const isFormatActive = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }, [editor])

  const toggleFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const isActive = isFormatActive(format)
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
    const state = StorageService.loadEditorState()
    StorageService.saveEditorState({ ...state, content: value })
  }, [editor, value, isFormatActive])

  const toggleFont = useCallback((font: string) => {
    setCurrentFont(font)
    Editor.addMark(editor, 'font', font)
    const state = StorageService.loadEditorState()
    StorageService.saveEditorState({ ...state, currentFont: font })
  }, [editor])

  const getCurrentFont = useCallback(() => {
    const marks = Editor.marks(editor)
    return currentFont || marks?.font || ''
  }, [editor, currentFont])

  const renderElement = useCallback((props: RenderElementProps) => {
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

  const editorStyle = useMemo(() => ({
    fontFamily: getCurrentFont() || 'inherit',
    minHeight: '100%'
  }), [getCurrentFont])

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
          style={editorStyle}
        />
      </Slate>
    </EditorContainer>
  )
} 