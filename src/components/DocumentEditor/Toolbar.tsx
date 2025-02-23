import React from 'react'
import { ToolbarContainer, Button } from '../../styles/toolbar.styles'

interface ToolbarProps {
  onToggleBold: () => void
  onToggleItalic: () => void
  onToggleUnderline: () => void
  isBoldActive: boolean
  isItalicActive: boolean
  isUnderlineActive: boolean
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  isBoldActive,
  isItalicActive,
  isUnderlineActive
}) => {
  return (
    <ToolbarContainer>
      <Button 
        onClick={onToggleBold}
        style={{ fontWeight: isBoldActive ? 'bold' : 'normal' }}
      >
        B
      </Button>
      <Button 
        onClick={onToggleItalic}
        style={{ fontStyle: isItalicActive ? 'italic' : 'normal' }}
      >
        I
      </Button>
      <Button 
        onClick={onToggleUnderline}
        style={{ textDecoration: isUnderlineActive ? 'underline' : 'none' }}
      >
        U
      </Button>
    </ToolbarContainer>
  )
} 