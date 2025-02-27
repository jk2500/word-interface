import React, { useCallback, useEffect, useState, useMemo } from 'react'
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

  // Cache for word count and serialized content to prevent unnecessary updates
  const contentCache = React.useRef({
    wordCount: 0,
    serializedContent: '',
    currentParagraph: ''
  })

  // Load metadata and update context
  useEffect(() => {
    const metadata = MetadataService.load()
    updateContext({
      type: 'TITLE_CHANGE',
      payload: {
        documentTitle: metadata.title
      }
    })
  }, [updateContext])

  // Handle content changes with optimized updates
  const handleContentChange = useCallback((value: Descendant[]) => {
    setValue(value)
    
    // Only save to storage when content actually changes
    const serialized = JSON.stringify(value)
    if (serialized !== contentCache.current.serializedContent) {
      debouncedSave(value, currentFont, formats)
      
      // Only calculate expensive operations when needed
      const currentParagraph = getCurrentParagraphText(editor)
      const wordCount = countWords(value)
      
      // Check if values have actually changed before updating context
      const hasWordCountChanged = wordCount !== contentCache.current.wordCount
      const hasParagraphChanged = currentParagraph !== contentCache.current.currentParagraph
      const hasContentChanged = serialized !== contentCache.current.serializedContent
      
      // Update cache
      contentCache.current = {
        wordCount,
        serializedContent: serialized,
        currentParagraph
      }
      
      // Only update context if something has actually changed
      if (hasWordCountChanged || hasParagraphChanged || hasContentChanged) {
        const updates: any = {}
        
        if (hasWordCountChanged) updates.totalWords = wordCount
        if (hasParagraphChanged) updates.currentParagraph = currentParagraph
        if (hasContentChanged) {
          updates.fullContent = serialized
          updates.lastEdit = new Date().toISOString()
        }
        
        updateContext({
          type: 'CONTENT_CHANGE',
          payload: updates
        })
      }
    }
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

  // Memoize style for editor
  const editorStyle = useMemo(() => ({ 
    fontFamily: getCurrentFont() || 'inherit',
    minHeight: '100%'
  }), [getCurrentFont])

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
          style={editorStyle}
        />
        
        <SelectionToolbar 
          editor={editor} 
          selection={editor.selection} 
        />
      </Slate>
    </EditorContainer>
  )
}