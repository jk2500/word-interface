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
  const getChatHistory = useCallback((): ChatHistoryItem[] => {
    // Combine prompt + context into a single system string
    const contextData = {
      selectedText: documentContext.selectedText,
      currentParagraph: documentContext.currentParagraph,
      totalWords: documentContext.totalWords,
      formatting: documentContext.currentFormat,
      documentTitle: documentContext.documentTitle,
      lastEdit: documentContext.lastEdit.toISOString()
    }

    // Now just merge the context into SYSTEM_PROMPT explicitly
    const fullSystemText = [
      SYSTEM_PROMPT.trim(),
      '', // blank line
      'DOCUMENT_CONTEXT:',
      JSON.stringify(contextData, null, 2)
    ].join('\n')

    // Create a single system message
    const systemMessages: ChatHistoryItem[] = [
      { role: 'system', content: fullSystemText }
    ]

    // Convert previous user/assistant messages to ChatHistoryItem
    const history: ChatHistoryItem[] = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 
            msg.sender === 'system' ? 'system' : 'assistant' as const,
      content: msg.text
    }))

    return [...systemMessages, ...history]
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

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get chat history INCLUDING system messages and document context
      const history = getChatHistory()
      console.log('Sending history:', history) // Add this for debugging
      
      // Send to API
      const aiResponse = await APIService.sendMessage(input, history)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse || 'Sorry, I could not process that.',
        sender: 'ai',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('Error getting AI response:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || 'Failed to get response from AI'}`,
        sender: 'ai',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, getChatHistory])

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
        {messages.map(message => (
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