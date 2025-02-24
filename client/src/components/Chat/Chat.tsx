import React, { useState, useCallback, useEffect } from 'react'
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
  ClearButton
} from '../../styles/chat.styles'
import { ChatMessage } from '../../types/chat'
import { StorageService } from '../../services/storage'
import { ChatHistoryItem, SYSTEM_PROMPT, AIService } from '../../services/ai'
import { APIService } from '../../services/api'
import { useDocumentContext } from '../../contexts/DocumentContext'

const COMMANDS = {
  FORMAT: '/format',
  HELP: '/help',
  EDIT: '/edit',
  ANALYZE: '/analyze'
} as const

const getSenderRole = (sender: 'user' | 'ai' | 'system'): 'user' | 'system' | 'assistant' => {
  switch (sender) {
    case 'user':
      return 'user'
    case 'system':
      return 'system'
    case 'ai':
      return 'assistant'
  }
}

export const Chat: React.FC = () => {
  const { documentContext } = useDocumentContext()
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    StorageService.getMessages()
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Save messages whenever they change
  useEffect(() => {
    StorageService.saveMessages(messages)
  }, [messages])

  // Convert messages to chat history format for AI
  const getChatHistory = useCallback((selectedText: string): ChatHistoryItem[] => {
    // Create the initial system prompt message.
    const systemPromptMessage: ChatHistoryItem = {
      role: 'system',
      content: SYSTEM_PROMPT.trim()
    }
  
    // Convert existing messages (only user and assistant) into history.
    const conversationHistory: ChatHistoryItem[] = messages
      .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
  
    // Create a new system message with just the current paragraph
    const documentContextMessage: ChatHistoryItem = {
      role: 'system',
      content: `Current Paragraph: "${documentContext.currentParagraph}"`
    }
  
    // Append the document context as the last entry.
    return [systemPromptMessage, ...conversationHistory, documentContextMessage]
  }, [messages, documentContext])
  



  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleCommand = useCallback((command: string, args: string) => {
    switch (command) {
      case COMMANDS.FORMAT:
        return `Current formatting:\n${JSON.stringify(documentContext.currentFormat, null, 2)}`
      case COMMANDS.HELP:
        return `Available commands:
- ${COMMANDS.FORMAT}: Show current formatting
- ${COMMANDS.EDIT}: Edit selected text
- ${COMMANDS.ANALYZE}: Analyze current paragraph
- ${COMMANDS.HELP}: Show this help message`
      case COMMANDS.ANALYZE:
        return `Analysis of current paragraph:
- Words: ${documentContext.totalWords}
- Format: ${documentContext.currentFormat.font}, ${
          documentContext.currentFormat.isBold ? 'bold' : 'normal'
        }
- Last edited: ${documentContext.lastEdit.toLocaleString()}`
      default:
        return null
    }
  }, [documentContext])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Current Paragraph: "${documentContext.currentParagraph}"`,
      sender: 'system',
      timestamp: Date.now()
    }

    const userMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    }

    // Add both messages to state before API call
    setMessages(prev => [...prev, systemMessage, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get chat history including system messages and document context
      const history = getChatHistory(documentContext.selectedText)
      
      // Send to API
      const aiResponse = await APIService.sendMessage(input, history)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: aiResponse || 'Sorry, I could not process that.',
        sender: 'ai',
        timestamp: Date.now()
      }

      // Add AI response
      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('Error getting AI response:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Error: ${error.message || 'Failed to get AI response'}`,
        sender: 'ai',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, getChatHistory, documentContext])

  const handleClear = useCallback(() => {
    setMessages([])
    StorageService.saveMessages([])  // Clear from storage too
  }, [])

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Chat Assistant</ChatTitle>
        <ClearButton onClick={handleClear}>
          Clear Chat
        </ClearButton>
      </ChatHeader>
      <MessageList>
        {messages
          // Only show user & ai messages
          .filter(m => m.sender === 'user' || m.sender === 'ai')
          .map(message => (
            <Message key={message.id} isUser={message.sender === 'user'}>
              <MessageBubble isUser={message.sender === 'user'}>
                {message.text}
              </MessageBubble>
              <Timestamp>{formatTime(message.timestamp)}</Timestamp>
            </Message>
          ))}
        {isLoading && (
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
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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
    </ChatContainer>
  )
}

export default Chat 