import styled from '@emotion/styled'

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