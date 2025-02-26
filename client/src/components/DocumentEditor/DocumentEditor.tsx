import React, { useCallback, useEffect, useState } from 'react'
import { Descendant } from 'slate'
import { Slate, Editable } from 'slate-react'
import { Toolbar } from './Toolbar'
import { EditorContainer } from '../../styles/editor.styles'
import { useDocumentContext } from '../../contexts/DocumentContext'
import { getCurrentParagraphText, countWords } from '../../utils/editor'
import { DocumentTitle } from './DocumentTitle'
import { MetadataService } from '../../services/metadataService'
import { SelectionToolbar } from './SelectionToolbar'
import { 
  useSlateEditor, 
  useDocumentSave, 
  useSelectionManager, 
  useEditorFormats,
  useEditorCommands
} from '../../hooks'

export const DocumentEditor: React.FC = () => {
  const { documentContext, updateContext } = useDocumentContext()
  
  // Use custom hooks for editor functionality
  const { editor, value, setValue, currentFont, formats } = useSlateEditor()
  const { debouncedSave } = useDocumentSave()
  const { handleSelectionChange, handleFocus, handleEditorBlur } = useSelectionManager(editor)
  const { toggleFormat, isFormatActive, toggleFont, getCurrentFont } = useEditorFormats(editor)
  
  // Initialize editor commands handler
  const { isStreaming } = useEditorCommands(editor)

  // Load metadata and update context
  useEffect(() => {
    const metadata = MetadataService.load()
    updateContext({
      type: 'CONTENT_CHANGE',
      context: {
        documentTitle: metadata.title
      }
    })
  }, [updateContext])

  // Handle content changes
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

  return (
    <EditorContainer className={isStreaming ? 'streaming' : ''}>
      <DocumentTitle />
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
        
        {/* Floating toolbar that appears on text selection */}
        <SelectionToolbar 
          editor={editor} 
          selection={editor.selection} 
        />
      </Slate>
    </EditorContainer>
  )
}