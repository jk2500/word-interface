import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { StorageService } from '../services/storage'
import { ChatMessage, ChatHistoryItem, AIChat } from '../types/chat'
import { AIService, SYSTEM_PROMPT } from '../services/ai'
import { useAIDocumentContext } from '../contexts/DocumentContext'
import { BaseMessage } from '@langchain/core/messages'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { createChatMessage, chatMessageToHistoryItem } from '../utils/chat'

// Maximum number of messages to store in local state before pruning
const MAX_MESSAGES = 50

/**
 * Custom hook to manage AI chat functionality with LangChain integration
 */
export function useAIChat(): AIChat {
  // Get document context directly from the specialized hook
  const documentContext = useAIDocumentContext();
  
  // Store chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    StorageService.getMessages()
  );
  const [isLoading, setIsLoading] = useState(false);
  
  // Create LangChain document agent with memoization
  const documentAgent = useMemo(() => {
    // Add the required currentFormat property if it's missing
    const contextWithFormat = {
      ...documentContext,
      currentFormat: documentContext.currentFormat || {
        isBold: false,
        isItalic: false,
        isUnderline: false,
        font: 'Arial'
      }
    };
    return AIService.createDocumentAgent(contextWithFormat);
  }, [
    documentContext.selectedText,
    documentContext.currentParagraph,
    documentContext.fullContent,
    documentContext.documentTitle
  ]);
  
  // Save messages with debouncing
  const saveMessagesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // Clear any existing timeout
    if (saveMessagesTimeoutRef.current) {
      clearTimeout(saveMessagesTimeoutRef.current);
    }
    
    // Set a new timeout to save messages after 500ms of inactivity
    saveMessagesTimeoutRef.current = setTimeout(() => {
      // Prune messages if they exceed the maximum
      const prunedMessages = messages.length > MAX_MESSAGES
        ? messages.slice(-MAX_MESSAGES)
        : messages;
        
      StorageService.saveMessages(prunedMessages);
    }, 500);
    
    // Clean up timeout on unmount
    return () => {
      if (saveMessagesTimeoutRef.current) {
        clearTimeout(saveMessagesTimeoutRef.current);
      }
    };
  }, [messages]);
  
  /**
   * Extract conversation messages for AI context in a reusable way
   */
  const getConversationMessages = useCallback((
    includeSystemMessages = false
  ): ChatMessage[] => {
    return messages.filter(msg => 
      msg.sender === 'user' || 
      msg.sender === 'ai' || 
      (includeSystemMessages && msg.sender === 'system')
    );
  }, [messages]);
  
  /**
   * Convert chat messages to LangChain message format
   */
  const getLangChainMessages = useCallback((): BaseMessage[] => {
    // Add system prompt first
    const result: BaseMessage[] = [
      new SystemMessage(SYSTEM_PROMPT.trim())
    ];
    
    // Then add conversation history
    return [
      ...result,
      ...getConversationMessages().map(msg => {
        if (msg.sender === 'user') {
          return new HumanMessage(msg.text);
        } else {
          return new AIMessage(msg.text);
        }
      })
    ];
  }, [getConversationMessages]);
  
  /**
   * Convert chat messages to AI service format with document context using MCP
   * (Legacy format for API compatibility)
   */
  const getChatHistory = useCallback((): ChatHistoryItem[] => {
    // Create the initial system prompt message
    const systemPromptMessage: ChatHistoryItem = {
      role: 'system',
      content: SYSTEM_PROMPT.trim()
    };
  
    // Convert existing messages to history using utility function
    const conversationHistory: ChatHistoryItem[] = getConversationMessages()
      .map(chatMessageToHistoryItem);
  
    // Add the required currentFormat property if it's missing
    const contextWithFormat = {
      ...documentContext,
      currentFormat: documentContext.currentFormat || {
        isBold: false, 
        isItalic: false,
        isUnderline: false,
        font: 'Arial'
      }
    };
    
    // Create structured document context message using MCP
    const documentContextMessage = AIService.getContextualPrompt(contextWithFormat);
  
    return [systemPromptMessage, ...conversationHistory, documentContextMessage];
  }, [getConversationMessages, documentContext]);
  
  /**
   * Send a message to the AI service using LangChain
   */
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Add user message to chat using utility function
      const userMessage = createChatMessage(messageText, 'user');
      setMessages(prev => [...prev, userMessage]);
      
      // Prepare LangChain messages with limited history
      const chatHistory = getLangChainMessages().slice(-10); // Limit history to last 10 messages
      
      // Use centralized AIService.executeAgent method
      const response = await AIService.executeAgent(
        documentAgent, 
        messageText, 
        chatHistory
      );
      
      // Create AI message from response using utility function
      const aiMessage = createChatMessage(response, 'ai');
      setMessages(prev => [...prev, aiMessage]);
      
      return aiMessage;
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      
      // Add error message to chat using utility function
      const errorMessage = createChatMessage(
        `Error: ${error.message || 'Failed to get AI response'}`,
        'system'
      );
      
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, documentAgent, getLangChainMessages]);

  return {
    messages,
    setMessages,
    isLoading,
    documentAgent,
    sendMessage
  };
}