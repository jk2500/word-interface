import styled from '@emotion/styled'

export const ChatContainer = styled.div`
  position: fixed;
  right: 40px;
  top: 40px;
  width: calc(33% - 60px);
  height: calc(100vh - 80px);
  background: ${({ theme }) => theme.paper};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px ${({ theme }) => theme.shadow};
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
`

export const Timestamp = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 4px;
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
  gap: 8px;
  background: ${({ theme }) => theme.paper};
  border-radius: 0 0 8px 8px;

  input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 20px;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    outline: none;
    transition: all 0.2s ease;
    opacity: ${props => props.isLoading ? 0.7 : 1};
    pointer-events: ${props => props.isLoading ? 'none' : 'auto'};

    &:focus {
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => `${theme.primary}1a`};
    }
  }

  button {
    padding: 10px 20px;
    background: ${({ theme }) => theme.active};
    color: ${({ theme }) => theme.text};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    opacity: ${props => props.isLoading ? 0.7 : 1};
    pointer-events: ${props => props.isLoading ? 'none' : 'auto'};

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
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
`

export const ChatTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
`

export const ClearButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.hover};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.active};
  }
` 