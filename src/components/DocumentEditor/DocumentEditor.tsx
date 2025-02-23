import React, { useMemo, useState } from 'react'
import { createEditor, Descendant, Editor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { Toolbar } from './Toolbar'
import { EditorContainer } from '../../styles/editor.styles'
import { INITIAL_EDITOR_VALUE } from '../../constants/editor'

export const DocumentEditor: React.FC = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState<Descendant[]>(INITIAL_EDITOR_VALUE)

  const toggleFormat = (format: 'bold' | 'italic' | 'underline') => {
    const isActive = isFormatActive(format)
    Editor.addMark(editor, format, !isActive)
  }

  const isFormatActive = (format: 'bold' | 'italic' | 'underline') => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }

  const toggleFont = (font: string) => {
    Editor.addMark(editor, 'font', font)
  }

  const getCurrentFont = () => {
    const marks = Editor.marks(editor)
    return marks?.font || ''
  }

  const renderElement = (props: any) => {
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
  }

  const renderLeaf = (props: any) => {
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
  }

  return (
    <EditorContainer>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={newValue => setValue(newValue)}
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
        />
      </Slate>
    </EditorContainer>
  )
} 