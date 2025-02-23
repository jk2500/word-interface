import styled from '@emotion/styled'

export const ToolbarContainer = styled.div`
  padding: 12px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 8px;
  align-items: center;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.paper};
  z-index: 10;
  transition: all 0.3s ease;
`

export const Button = styled.button`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.paper};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.hover};
  }

  &:active {
    background: #e1e4e8;
  }

  &[data-active="true"] {
    background: ${({ theme }) => theme.active};
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`

export const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 14px;
  min-width: 140px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  outline: none;
  background: ${({ theme }) => theme.paper};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.border};
  }

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.primary}1a`};
  }

  option {
    background: ${({ theme }) => theme.paper};
    color: ${({ theme }) => theme.text};
  }
`

export const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.divider};
  margin: 0 8px;
` 