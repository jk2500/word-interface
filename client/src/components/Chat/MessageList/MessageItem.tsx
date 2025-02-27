import React, { useEffect, useState } from 'react';
import { Message, MessageBubble, Timestamp } from '../styles';
import { ChatMessage, CHAT_COMMANDS } from '../../../types/chat';
import { formatTime } from '../ChatUtils';
import { useChatCommands } from '../../../hooks/useChatCommands';

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const { handleCommand } = useChatCommands();
  const [displayText, setDisplayText] = useState(message.text);
  
  // Process commands in the message when it arrives
  useEffect(() => {
    if (!isUser && !isSystem) {
      // Check for commands at the beginning of a line
      const lines = message.text.split('\n');
      let processedText = message.text;
      let commandProcessed = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check for specific commands
        Object.values(CHAT_COMMANDS).forEach(cmd => {
          if (line.startsWith(cmd + ' ') || line === cmd) {
            const commandText = line.substring(cmd.length).trim();
            const success = handleCommand(cmd, commandText);
            
            if (success) {
              // Replace the command line with a user-friendly message
              lines[i] = `[${cmd.substring(1)} command executed]`;
              commandProcessed = true;
            }
          }
        });
      }
      
      if (commandProcessed) {
        processedText = lines.join('\n');
        setDisplayText(processedText);
      }
    }
  }, [message.text, isUser, isSystem, handleCommand]);
  
  return (
    <Message key={message.id} isUser={isUser}>
      <MessageBubble 
        isUser={isUser}
        className={isSystem ? 'system' : ''}
      >
        {displayText}
      </MessageBubble>
      <Timestamp>{formatTime(message.timestamp)}</Timestamp>
    </Message>
  );
};

export default React.memo(MessageItem);