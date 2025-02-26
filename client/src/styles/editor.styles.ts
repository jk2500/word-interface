import styled from '@emotion/styled'

export const EditorContainer = styled.div`
  width: calc(66% - 60px); // 2/3 of the screen minus margins
  height: calc(100vh - 80px);
  position: fixed;
  top: 40px;
  left: 40px;  // Changed from 50% transform
  margin: 0;
  transform: none;  // Remove centering transform
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 0;  // Reset padding here

  // Theme-based styles
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.paper};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  // Editor styles
  [data-slate-editor="true"] {
    outline: none;
    flex: 1;
    overflow-y: auto;
    font-size: 16px;
    line-height: 1.8;
    color: ${({ theme }) => theme.text};
    padding: 30px 50px;  // Increased padding for better readability
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

  // Typing cursor animation for streaming effect
  &.streaming [data-slate-editor="true"]::after {
    content: '|';
    display: inline-block;
    color: ${({ theme }) => theme.primary};
    animation: blink 1s steps(2) infinite;
    margin-left: 2px;
  }

  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
`

export const FloatingToolbar = styled.div`
  position: absolute;
  z-index: 10;
  display: flex;
  background-color: #2c2c2c;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 6px;
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: center bottom;
  
  &.hidden {
    opacity: 0;
    transform: scale(0.95) translateY(5px);
    pointer-events: none;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #2c2c2c;
  }
`

export const ToolbarButton = styled.button`
  background: transparent;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  margin: 0 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    margin-right: 4px;
    width: 16px;
    height: 16px;
  }
`

export const EditPromptOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`

export const EditPromptContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`

export const EditPromptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  }
  
  button {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #666;
    
    &:hover {
      color: #333;
    }
  }
`

export const SelectedTextPreview = styled.div`
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  max-height: 100px;
  overflow-y: auto;
  border-left: 3px solid #61dafb;
`

export const EditPromptInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  margin-bottom: 16px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #61dafb;
    box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
  }
`

export const EditPromptButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  
  button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    
    &.cancel {
      background-color: transparent;
      border: 1px solid #ddd;
      color: #666;
      
      &:hover {
        background-color: #f5f5f5;
      }
    }
    
    &.submit {
      background-color: #61dafb;
      border: 1px solid #61dafb;
      color: #fff;
      
      &:hover {
        background-color: #50c8f0;
      }
      
      &:disabled {
        background-color: #cccccc;
        border-color: #cccccc;
        cursor: not-allowed;
      }
    }
  }
` 