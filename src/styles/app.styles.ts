import styled from '@emotion/styled'

export const AppContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: ${({ theme }) => theme.background};
  position: fixed;  // Prevent page scrolling
  top: 0;
  left: 0;
  overflow: hidden;  // Prevent scrolling outside editor
  transition: background-color 0.3s ease;
` 