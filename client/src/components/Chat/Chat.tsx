import React, { useState, useCallback } from 'react'
import { 
  ChatContainer, 
  MessageList, 
  Message,
  MessageBubble,
  Timestamp,
  InputContainer,
  LoadingDots,
  ChatHeader,
  ChatTitle,
  ClearButton,
  AgentModeToggle
} from '../../styles/chat.styles'
import { ChatMessage } from '../../types/chat'
import { StorageService } from '../../services/storage'
import { parseEditCommand } from '../../utils/editor'
import { useDocumentContext } from '../../contexts/DocumentContext'
import { useAIChat, useChatCommands } from '../../hooks'
import { RunnableSequence } from '@langchain/core/runnables'

export const Chat: React.FC = () => {
  const { documentContext } = useDocumentContext()
  const { 
    messages, 
    setMessages, 
    isLoading, 
    streamingMessage, 
    sendMessage,
    streamMessage,
    getChatHistory,
    documentAgent
  } = useAIChat(documentContext)
  const { 
    handleCommand, 
    executeWithAgent,
    COMMANDS 
  } = useChatCommands(documentContext)
  const [input, setInput] = useState('')
  const [useAgentMode, setUseAgentMode] = useState(false) // Use LangChain agent by default

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const processAIResponse = useCallback((aiText: string) => {
    const DISABLE_NEWLINE_HANDLING = true; // Temporary flag
    
    // Log the raw text from the LLM before any processing
    console.log('RAW LLM RESPONSE:', aiText);
    
    // Check if AI response contains commands
    let processedText = aiText || '';
    
    // Check for edit commands
    if (aiText.includes('/edit')) {
      const editLineRegex = /\/edit\s+(.+?)(\n|$)/g;
      const editMatches = [...aiText.matchAll(editLineRegex)];
      
      for (const match of editMatches) {
        const editCommand = match[0].trim();
        const editArgs = match[1].trim();
        const editData = parseEditCommand(editArgs);
        
        if (editData) {
          // Create an edit event
          const editEvent = new CustomEvent('editCommand', {
            detail: editData
          });
          document.dispatchEvent(editEvent);
          
          // Replace the command with a confirmation message
          processedText = processedText.replace(
            editCommand,
            `✓ Edited text: replaced "${editData.oldText}" with "${editData.newText}"`
          );
        }
      }
    }
    
    // Check for write commands
    if (aiText.includes('/write')) {
      if (DISABLE_NEWLINE_HANDLING) {
        // Improved regex that captures all content after /write
        const writeLineRegex = /\/write\s+([\s\S]+)$/;
        const match = aiText.match(writeLineRegex);
        
        if (match && match[1]) {
          // Get the content and clean it of any problematic repetitions
          let content = match[1].trim();
          // Remove any obvious duplicated content (common in LLM outputs)
          content = content.replace(/(.+?)\1+/g, '$1');
          console.log('EXTRACTED CONTENT:', content);
          
          // Create a write event
          const writeEvent = new CustomEvent('writeCommand', {
            detail: { content }
          });
          document.dispatchEvent(writeEvent);
          
          // Replace the command with a confirmation message
          processedText = `✓ Content inserted: "${content.length > 40 ? content.substring(0, 40) + '...' : content}"`;
        }
      } else {
        // Original code with regex for newline handling
        const writeLineRegex = /\/write\s+(.+?)(?=\n\/|\n\n|$)/gs;
        const writeMatches = [...aiText.matchAll(writeLineRegex)];
        
        for (const match of writeMatches) {
          const writeCommand = match[0].trim();
          const content = match[1].trim();
          
          if (content) {
            // Create a write event
            const writeEvent = new CustomEvent('writeCommand', {
              detail: { content }
            });
            document.dispatchEvent(writeEvent);
            
            // Replace the command with a confirmation message
            processedText = processedText.replace(
              writeCommand,
              `✓ Content inserted: "${content.length > 40 ? content.substring(0, 40) + '...' : content}"`
            );
          }
        }
      }
    }
    
    // Log the processed text after all processing
    console.log('PROCESSED TEXT:', processedText);
    
    return processedText;
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    // Check if the input starts with a command prefix
    const inputTrimmed = input.trim();
    
    // Add user message first regardless of what happens next
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Toggle agent mode through special command
    if (inputTrimmed === '/agent') {
      setUseAgentMode(!useAgentMode)
      const modeMessage: ChatMessage = {
        id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: `Agent mode ${!useAgentMode ? 'enabled' : 'disabled'}. ${!useAgentMode ? 'Using LangChain agent for enhanced context processing.' : 'Using basic command processing.'}`,
        sender: 'system',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, modeMessage])
      return
    }

    // Process command with the agent if in agent mode
    if (useAgentMode && documentAgent) {
      try {
        // Process the message using the LangChain agent
        const agentResponse = await executeWithAgent(documentAgent, inputTrimmed)
        
        // Create AI message from response
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text: agentResponse,
          sender: 'ai',
          timestamp: Date.now()
        }
        
        setMessages(prev => [...prev, aiMessage])
        return
      } catch (error) {
        console.error('Error in agent processing:', error)
        // Fall back to basic processing if agent fails
      }
    }
    
    // Basic command processing for non-agent mode or fallback
    if (inputTrimmed.startsWith('/')) {
      const spaceIndex = inputTrimmed.indexOf(' ');
      const command = spaceIndex !== -1 
        ? inputTrimmed.substring(0, spaceIndex) 
        : inputTrimmed;
      const args = spaceIndex !== -1 
        ? inputTrimmed.substring(spaceIndex + 1) 
        : '';
      
      const response = handleCommand(command, args);
      if (response) {
        const systemResponse: ChatMessage = {
          id: `system-${Date.now()}`,
          text: response,
          sender: 'system',
          timestamp: Date.now()
        }
        
        setMessages(prev => [...prev, systemResponse]);
        return;
      }
    }

    // Default to streaming for non-command responses
    streamMessage(input, userMessage.id); // Pass the user message ID to prevent duplication
    
  }, [input, isLoading, useAgentMode, documentAgent, streamMessage, executeWithAgent, handleCommand, setMessages])

  const handleClear = useCallback(() => {
    setMessages([])
    StorageService.saveMessages([])  // Clear from storage too
  }, [setMessages])

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>
          Chat Assistant {useAgentMode && <span className="agent-badge">Agent</span>}
        </ChatTitle>
        <div>
          <AgentModeToggle 
            active={useAgentMode}
            onClick={() => setUseAgentMode(!useAgentMode)}
          >
            {useAgentMode ? 'Agent Mode: ON' : 'Agent Mode: OFF'}
          </AgentModeToggle>
          <ClearButton onClick={handleClear}>
            Clear Chat
          </ClearButton>
        </div>
      </ChatHeader>
      <MessageList>
        {messages
          // Show all messages including system ones
          .map(message => (
            <Message key={message.id} isUser={message.sender === 'user'}>
              <MessageBubble 
                isUser={message.sender === 'user'}
                className={`${message.streaming ? 'streaming' : ''} ${message.sender === 'system' ? 'system' : ''}`}
              >
                {message.sender === 'ai' ? processAIResponse(message.text) : message.text}
              </MessageBubble>
              <Timestamp>{formatTime(message.timestamp)}</Timestamp>
            </Message>
          ))}
        
        {/* Show streaming message if available */}
        {streamingMessage && (
          <Message key={streamingMessage.id} isUser={false}>
            <MessageBubble 
              isUser={false}
              className="streaming"
            >
              {processAIResponse(streamingMessage.text)}
            </MessageBubble>
            <Timestamp>{formatTime(streamingMessage.timestamp)}</Timestamp>
          </Message>
        )}
        
        {/* Show loading animation when no streaming message is available */}
        {isLoading && !streamingMessage && (
          <Message isUser={false}>
            <LoadingDots>
              <span></span>
              <span></span>
              <span></span>
            </LoadingDots>
          </Message>
        )}
      </MessageList>
      <InputContainer isLoading={isLoading}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isLoading ? "AI is thinking..." : `Type a message${useAgentMode ? ' (Agent Mode)' : ''}...`}
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </InputContainer>
    </ChatContainer>
  )
}

export default Chat