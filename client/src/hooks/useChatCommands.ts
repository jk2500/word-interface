import { useCallback } from 'react';
import { RunnableSequence } from '@langchain/core/runnables';
import { useDocumentContext, useAIDocumentContext } from '../contexts/DocumentContext';
import { parseEditCommand } from '../utils/editor';
import { AIService } from '../services/ai';
import { BaseMessage } from '@langchain/core/messages';
import { CHAT_COMMANDS } from '../types/chat';

/**
 * Custom hook to handle chat commands for document editing
 */
export const useChatCommands = () => {
  // Get document context from the specialized hook
  const documentContext = useAIDocumentContext();
  // Get the update context function
  const { updateContext } = useDocumentContext();

  /**
   * Handle a command in the chat
   */
  const handleCommand = useCallback((command: string, text: string): boolean => {
    if (!command || !text) return false;
    
    const commandLower = command.toLowerCase();
    
    switch (commandLower) {
      case CHAT_COMMANDS.INSERT:
        // Handle insertion at cursor position
        if (text && typeof window !== 'undefined') {
          const event = new CustomEvent('editor-insert-text', { detail: { text } });
          window.dispatchEvent(event);
          return true;
        }
        return false;
        
      case CHAT_COMMANDS.REPLACE:
        // Handle replace selected text
        if (text && documentContext.selectedText && typeof window !== 'undefined') {
          const event = new CustomEvent('editor-replace-text', { 
            detail: { oldText: documentContext.selectedText, newText: text } 
          });
          window.dispatchEvent(event);
          return true;
        }
        return false;
        
      case CHAT_COMMANDS.EDIT:
        // Handle editing with custom format
        if (text && typeof window !== 'undefined') {
          const editCommand = parseEditCommand(text);
          if (editCommand) {
            const event = new CustomEvent('editor-replace-text', { 
              detail: { oldText: editCommand.oldText, newText: editCommand.newText } 
            });
            window.dispatchEvent(event);
            return true;
          }
        }
        return false;
        
      case CHAT_COMMANDS.WRITE:
        // Handle the write command
        if (text && typeof window !== 'undefined') {
          const event = new CustomEvent('writeCommand', { detail: { content: text } });
          document.dispatchEvent(event);
          return true;
        }
        return false;
        
      default:
        return false;
    }
  }, [documentContext.selectedText]);
  
  /**
   * Execute an agent with the given message using the centralized AIService
   */
  const executeWithAgent = useCallback(async (
    agent: RunnableSequence, 
    message: string,
    chatHistory: BaseMessage[] = []
  ): Promise<string> => {
    // Use the centralized AIService.executeAgent method
    return AIService.executeAgent(agent, message, chatHistory);
  }, []);
  
  return {
    handleCommand,
    executeWithAgent,
    COMMANDS: CHAT_COMMANDS
  };
};