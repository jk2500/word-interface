import { useCallback } from 'react'
import { DocumentContext } from '../types/document'
import { parseEditCommand } from '../utils/editor'
import { AIService } from '../services/ai'
import { ChatCommands } from '../types/chat'

/**
 * Custom hook to handle chat commands with optional LangChain agent support
 */
export function useChatCommands(documentContext: DocumentContext): ChatCommands {
  const COMMANDS = {
    FORMAT: '/format',
    HELP: '/help',
    EDIT: '/edit',
    ANALYZE: '/analyze',
    WRITE: '/write'
  } as const

  /**
   * Process command and return appropriate response
   */
  const handleCommand = useCallback((command: string, args: string) => {
    switch (command) {
      case COMMANDS.FORMAT:
        return `Current formatting:\n${JSON.stringify(documentContext.currentFormat, null, 2)}`
      case COMMANDS.HELP:
        return `Available commands:
- ${COMMANDS.FORMAT}: Show current formatting
- ${COMMANDS.EDIT}: Edit selected text (e.g., ${COMMANDS.EDIT} replace "old text" with "new text")
- ${COMMANDS.WRITE}: Write content at current cursor position (e.g., ${COMMANDS.WRITE} This is new text)
- ${COMMANDS.ANALYZE}: Analyze document structure and content
- ${COMMANDS.HELP}: Show this help message`
      case COMMANDS.ANALYZE:
        return `Analysis of document:
- Total words: ${documentContext.totalWords}
- Current format: ${documentContext.currentFormat.font}, ${
          documentContext.currentFormat.isBold ? 'bold' : 'normal'
        }
- Last edited: ${documentContext.lastEdit.toLocaleString()}
- Document title: ${documentContext.documentTitle || 'Untitled Document'}`
      case COMMANDS.EDIT:
        // Parse the edit command to extract old and new text
        const editData = parseEditCommand(args);
        if (editData) {
          // Dispatch a custom event to notify the editor
          const editEvent = new CustomEvent('editCommand', {
            detail: editData
          });
          document.dispatchEvent(editEvent);
          
          return `Editing text: replacing "${editData.oldText}" with "${editData.newText}"`;
        } else {
          return `Invalid edit command. Try something like:
- ${COMMANDS.EDIT} replace "old text" with "new text"
- ${COMMANDS.EDIT} "old text" to "new text"`;
        }
      case COMMANDS.WRITE:
        if (!args.trim()) {
          return `Invalid write command. Please provide the content to write.`;
        }
        
        // Dispatch a custom event to notify the editor to insert text at cursor position
        const writeEvent = new CustomEvent('writeCommand', {
          detail: { content: args }
        });
        document.dispatchEvent(writeEvent);
        
        return `Content inserted at cursor position.`;
      default:
        return null
    }
  }, [documentContext])
  
  /**
   * Execute commands using LangChain agent
   * @param agent The document agent from LangChain
   * @param commandText Full command text
   * @returns Promise with processing result
   */
  const executeWithAgent = useCallback(async (
    agent: any,
    commandText: string
  ): Promise<string> => {
    try {
      // Extract command components if it's a command
      if (commandText.startsWith('/')) {
        const parts = commandText.split(' ')
        const command = parts[0]
        const args = parts.slice(1).join(' ')
        
        // Handle standard commands with built-in logic
        const standardResponse = handleCommand(command, args)
        if (standardResponse) {
          return standardResponse
        }
        
        // For edit command with selection, use AI specialized editing
        if (command === COMMANDS.EDIT && documentContext.selectedText) {
          const editData = parseEditCommand(args)
          
          if (editData) {
            try {
              // Use the specialized editor chain
              const editedText = await AIService.getEditing(
                documentContext.selectedText,
                `Replace "${editData.oldText}" with "${editData.newText}"`
              )
              
              // Since we already handled the edit via native command, just return
              return `Edited the text by replacing "${editData.oldText}" with "${editData.newText}".`
            } catch (error) {
              console.error('Error in AI editing:', error)
              return `Error during editing: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          }
        }
        
        // For write command, use agent to generate and improve content
        if (command === COMMANDS.WRITE && args) {
          try {
            // Let agent generate enhanced content based on context
            const enhancedContent = await agent.invoke({
              input: `Generate content for: ${args}. Keep your response focused on just the content to write, with minimal explanations.`,
              chat_history: []
            })
            
            // Extract just the content portion (removing any explanations)
            const contentOnly = enhancedContent
              .replace(/^I'll (write|generate|create) (an?|the) .+?:\n\n/i, '')
              .replace(/^Here's (an?|the) .+?:\n\n/i, '')
              .replace(/^Here is .+?:\n\n/i, '')
              .trim()
            
            // Dispatch the event with the enhanced content
            const writeEvent = new CustomEvent('writeCommand', {
              detail: { content: contentOnly }
            })
            document.dispatchEvent(writeEvent)
            
            return `Content has been inserted at the cursor position.`
          } catch (error) {
            console.error('Error in AI content generation:', error)
            return `Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      }
      
      // For non-command text or unhandled commands, process with agent
      return await agent.invoke({
        input: commandText,
        chat_history: []
      })
    } catch (error) {
      console.error('Error executing with agent:', error)
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }, [documentContext, handleCommand, COMMANDS])
  
  return { 
    handleCommand,
    executeWithAgent,
    COMMANDS
  }
}