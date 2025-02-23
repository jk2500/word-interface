import styled from '@emotion/styled'

const BaseButton = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.paper};
  color: ${({ theme }) => theme.text};
`

export const ToolbarContainer = styled.div`
  padding: 12px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 8px;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: all 0.3s ease;
  border-bottom: 2px solid ${({ theme }) => theme.divider};
  background: ${({ theme }) => theme.paper};
`

export const Button = styled(BaseButton)`
  &:hover {
    background: ${({ theme }) => theme.hover};
  }

  &[data-active="true"] {
    background: ${({ theme }) => theme.active};
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`

export const Select = styled(BaseButton.withComponent('select'))`
  min-width: 140px;
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
  margin: 0 8px;
  background: ${({ theme }) => theme.divider};
` 