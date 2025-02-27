import styled from '@emotion/styled'

export const ChatContainer = styled.div`
  position: fixed;
  right: 40px;
  top: 40px;
  width: calc(33% - 60px);
  height: calc(100vh - 80px);
  background: ${({ theme }) => theme.paper};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  className: 'chat-container';
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`

export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const Message = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`

export const MessageBubble = styled.div<{ isUser: boolean }>`
  padding: 8px 12px;
  border-radius: 12px;
  background: ${({ theme, isUser }) => 
    isUser ? theme.active : theme.hover};
  color: ${({ theme }) => theme.text};
  word-wrap: break-word;
  max-width: 100%;
  transition: all 0.3s ease;
  
  &.system {
    background-color: ${({ theme }) => `${theme.primary}1a`};
    border-left: 3px solid ${({ theme }) => theme.primary};
    font-style: italic;
    font-size: 13px;
  }
`

export const Timestamp = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 4px;
  transition: color 0.3s ease;
`

export const LoadingDots = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.hover};
  border-radius: 12px;
  align-self: flex-start;

  span {
    width: 4px;
    height: 4px;
    background: ${({ theme }) => theme.text};
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-of-type(1) { animation-delay: -0.32s; }
    &:nth-of-type(2) { animation-delay: -0.16s; }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`

export const InputContainer = styled.div<{ isLoading: boolean }>`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 10px;
  background: ${({ theme }) => theme.paper};
  border-radius: 0 0 12px 12px;
  transition: all 0.3s ease;

  input {
    flex: 1;
    padding: 12px 18px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 24px;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    outline: none;
    transition: all 0.3s ease;
    opacity: ${props => props.isLoading ? 0.7 : 1};
    pointer-events: ${props => props.isLoading ? 'none' : 'auto'};
    font-size: 14px;

    &:focus {
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => `${theme.primary}1a`};
    }
  }

  button {
    padding: 12px 24px;
    background: ${({ theme }) => theme.active};
    color: ${({ theme }) => theme.text};
    border: none;
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    opacity: ${props => props.isLoading ? 0.7 : 1};
    pointer-events: ${props => props.isLoading ? 'none' : 'auto'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-size: 14px;

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
`

export const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.paper};
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
`

export const ChatTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  
  .agent-badge {
    margin-left: 8px;
    background-color: #4CAF50;
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 400;
  }
`

export const ClearButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.hover};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.active};
  }
` 