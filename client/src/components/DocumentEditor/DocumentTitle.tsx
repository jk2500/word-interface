import React, { useState, useCallback } from 'react'
import { TitleInput } from './DocumentTitle.styles'
import { MetadataService } from '../../services/metadataService'
import { useDocumentContext } from '../../contexts/DocumentContext'

export const DocumentTitle: React.FC = () => {
  const { updateContext } = useDocumentContext()
  const [title, setTitle] = useState(MetadataService.load().title)

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value || 'Untitled Document'
    setTitle(newTitle)
    MetadataService.save({ title: newTitle })
    updateContext({
      type: 'CONTENT_CHANGE',
      context: { documentTitle: newTitle }
    })
  }, [updateContext])

  return (
    <TitleInput
      value={title}
      onChange={handleTitleChange}
      placeholder="Untitled Document"
    />
  )
} 