import styled from '@emotion/styled'

export const EditorContainer = styled.div`
  max-width: 800px;
  width: calc(100% - 40px);  // Account for margins
  margin: 0 auto;
  padding: 30px 40px;
  height: calc(100vh - 80px);
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  transition: all 0.3s ease;

  // Theme-based styles
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.paper};
  box-shadow: 0 2px 12px ${({ theme }) => theme.shadow};
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 16px ${({ theme }) => theme.shadow};
  }

  // Editor styles
  [data-slate-editor="true"] {
    outline: none;
    flex: 1;
    overflow-y: auto;
    font-size: 16px;
    line-height: 1.6;
    color: ${({ theme }) => theme.text};
    padding: 20px 0;
    transition: color 0.3s ease;
    
    // Hide scrollbar but keep functionality
    scrollbar-width: thin;
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.border};
      border-radius: 4px;
    }
  }

  // Style the placeholder
  [data-slate-placeholder="true"] {
    color: ${({ theme }) => theme.placeholder};
    font-style: italic;
    transition: color 0.3s ease;
  }
` 