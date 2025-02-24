import styled from '@emotion/styled'

export const TitleInput = styled.input`
  font-size: 24px;
  font-weight: 500;
  padding: 8px 12px;
  margin-bottom: 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  width: 100%;
  
  &:hover {
    border-color: ${({ theme }) => theme.border};
  }
  
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
` 