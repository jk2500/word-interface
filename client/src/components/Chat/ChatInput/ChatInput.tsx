import React, { useState, KeyboardEvent } from 'react';
import { InputContainer } from '../styles';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  return (
    <InputContainer isLoading={isLoading}>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? "AI is thinking..." : "Type a message..."}
        disabled={isLoading}
      />
      <button 
        onClick={handleSend}
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </InputContainer>
  );
};

export default React.memo(ChatInput);