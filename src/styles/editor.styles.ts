import styled from '@emotion/styled'

export const EditorContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 30px 40px;
  min-height: 800px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  transition: all 0.3s ease;

  // Theme-based styles
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.paper};
  box-shadow: 0 2px 12px ${({ theme }) => theme.shadow};

  &:hover {
    box-shadow: 0 4px 16px ${({ theme }) => theme.shadow};
  }

  // Editor styles
  [data-slate-editor="true"] {
    outline: none;
    flex: 1;
    min-height: 400px;
    font-size: 16px;
    line-height: 1.6;
    color: ${({ theme }) => theme.text};
  }

  // Placeholder styles
  [data-slate-placeholder="true"] {
    color: ${({ theme }) => theme.placeholder};
    font-style: italic;
  }
` 