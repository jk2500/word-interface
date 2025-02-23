import React from 'react'
import { ToolbarContainer, Button, Select } from '../../styles/toolbar.styles'
import { useSlate, ReactEditor } from 'slate-react'
import { Editor, Element, Transforms } from 'slate'
import { ALIGNMENT_ICONS, FONT_OPTIONS, Alignment } from '../../constants/toolbar'
import { CustomElement } from '../../types/editor'

interface ToolbarProps {
  onToggleBold: () => void
  onToggleItalic: () => void
  onToggleUnderline: () => void
  isBoldActive: boolean
  isItalicActive: boolean
  isUnderlineActive: boolean
  onFontChange: (font: string) => void
  currentFont: string
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  isBoldActive,
  isItalicActive,
  isUnderlineActive,
  onFontChange,
  currentFont
}) => {
  const editor = useSlate()

  const toggleAlign = (alignment: Alignment) => {
    const nodes = Array.from(
      Editor.nodes(editor, {
        match: n => Element.isElement(n) && (n as CustomElement).type === 'paragraph',
      })
    )
    
    for (const [, path] of nodes) {
      Transforms.setNodes(editor, { align: alignment }, { at: path })
    }
  }

  // Helper: re-focus the editor after an action
  const refocusEditor = () => {
    setTimeout(() => ReactEditor.focus(editor), 0)
  }

  return (
    <ToolbarContainer>
      <Select 
        onChange={(e) => {
          onFontChange(e.target.value)
          refocusEditor()
        }}
        value={currentFont}
      >
        {FONT_OPTIONS.map(font => (
          <option key={font} value={font}>{font}</option>
        ))}
      </Select>

      <Button
        onClick={() => {
          onToggleBold()
          refocusEditor()
        }}
        style={{ fontWeight: isBoldActive ? 'bold' : 'normal' }}
      >
        B
      </Button>

      <Button
        onClick={() => {
          onToggleItalic()
          refocusEditor()
        }}
        style={{ fontStyle: isItalicActive ? 'italic' : 'normal' }}
      >
        I
      </Button>

      <Button
        onClick={() => {
          onToggleUnderline()
          refocusEditor()
        }}
        style={{ textDecoration: isUnderlineActive ? 'underline' : 'none' }}
      >
        U
      </Button>

      <div style={{ borderLeft: '1px solid #ccc', margin: '0 8px' }} />
      {(Object.entries(ALIGNMENT_ICONS) as [Alignment, string][]).map(([align, icon]) => (
        <Button
          key={align}
          onClick={() => {
            toggleAlign(align)
            refocusEditor()
          }}
        >
          {icon}
        </Button>
      ))}
    </ToolbarContainer>
  )
} 