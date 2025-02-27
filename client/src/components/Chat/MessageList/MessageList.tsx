import React from 'react';
import { MessageListContainer, Message, LoadingDots } from '../styles';
import { ChatMessage } from '../../../types/chat';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  return (
    <MessageListContainer>
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
      
      {/* Show loading animation when waiting for response */}
      {isLoading && (
        <Message isUser={false}>
          <LoadingDots>
            <span></span>
            <span></span>
            <span></span>
          </LoadingDots>
        </Message>
      )}
    </MessageListContainer>
  );
};

export default React.memo(MessageList);