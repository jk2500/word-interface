import styled from '@emotion/styled'

export const MessageListContainer = styled.div`
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