import { ChatMessage, ChatHistoryItem } from '../types/chat';

/**
 * Creates a chat message with consistent structure and ID generation
 */
export const createChatMessage = (
  text: string, 
  sender: 'user' | 'ai' | 'system'
): ChatMessage => ({
  id: `${sender}-${Date.now()}`,
  text,
  sender,
  timestamp: Date.now()
});

/**
 * Converts ChatMessage to ChatHistoryItem format for AI services
 */
export const chatMessageToHistoryItem = (message: ChatMessage): ChatHistoryItem => ({
  role: message.sender === 'user' ? 'user' : 'assistant',
  content: message.text
});