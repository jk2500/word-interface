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