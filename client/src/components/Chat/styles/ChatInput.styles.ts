import styled from '@emotion/styled'

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