import styled from '@emotion/styled'

export const EditorContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 500px;
  display: flex;
  flex-direction: column;

  // Remove the default outline when clicking
  [data-slate-editor="true"] {
    outline: none;
    flex: 1;
    min-height: 400px; // Leave some space for toolbar
  }

  // Make the editable div fill the container
  [contenteditable="true"] {
    flex: 1;
    min-height: 400px;
  }
` 