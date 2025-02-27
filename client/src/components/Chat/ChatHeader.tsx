import React from 'react';
import { 
  ChatHeader as StyledHeader, 
  ChatTitle, 
  ClearButton 
} from './styles';

interface ChatHeaderProps {
  onClear: () => void;
  title?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onClear, 
  title = 'Chat Assistant' 
}) => {
  return (
    <StyledHeader>
      <ChatTitle>{title}</ChatTitle>
      <div>
        <ClearButton onClick={onClear}>
          Clear Chat
        </ClearButton>
      </div>
    </StyledHeader>
  );
};

export default ChatHeader;