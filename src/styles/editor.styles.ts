import styled from '@emotion/styled'

export const EditorContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 30px 40px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  min-height: 800px;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.paper};
  box-shadow: 0 2px 12px ${({ theme }) => theme.shadow};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px ${({ theme }) => theme.shadow};
  }

  [data-slate-editor="true"] {
    outline: none;
    flex: 1;
    min-height: 400px;
    font-size: 16px;
    line-height: 1.6;
    color: ${({ theme }) => theme.text};
  }

  [contenteditable="true"] {
    flex: 1;
    min-height: 400px;
    padding: 20px 0;
  }

  // Style the placeholder
  [data-slate-placeholder="true"] {
    color: ${({ theme }) => theme.placeholder};
    font-style: italic;
  }
` 