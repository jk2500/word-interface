import styled from '@emotion/styled'

export const ToolbarContainer = styled.div`
  padding: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ccc;
  display: flex;
  gap: 8px;
`

export const Button = styled.button`
  padding: 5px 10px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
`

export const Select = styled.select`
  padding: 5px;
  margin-right: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 14px;
  min-width: 120px;
  outline: none;

  &:focus {
    border-color: #ccc;
  }
` 