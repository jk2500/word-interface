import React, { useCallback } from 'react';
import { ChatContainer } from './styles';
import { StorageService } from '../../services/storage';
import { useAIChat } from '../../hooks';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const Chat: React.FC = () => {
  // Get AI chat functionality without passing document context
  const { 
    messages, 
    setMessages, 
    isLoading, 
    sendMessage
  } = useAIChat();

  const handleClear = useCallback(() => {
    setMessages([]);
    StorageService.saveMessages([]);
  }, [setMessages]);

  // Use the sendMessage function directly from the hook
  const handleSend = useCallback(async (message: string) => {
    await sendMessage(message);
  }, [sendMessage]);

  return (
    <ChatContainer>
      <ChatHeader onClear={handleClear} />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </ChatContainer>
  );
};

export default Chat;