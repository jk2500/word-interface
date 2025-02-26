import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { StorageService } from '../services/storage'
import { ChatMessage, ChatHistoryItem, AIChat } from '../types/chat'
import { AIService, SYSTEM_PROMPT } from '../services/ai'
import { APIService } from '../services/api'
import { DocumentContext } from '../types/document'
import { BaseMessage } from '@langchain/core/messages'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'

// Maximum number of messages to store in local state before pruning
const MAX_MESSAGES = 50

/**
 * Custom hook to manage AI chat functionality with LangChain integration
 */
export function useAIChat(documentContext: DocumentContext): AIChat {
  // Store chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    StorageService.getMessages()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null)
  
  // Track previous document context to avoid recreating agent unnecessarily
  const prevDocumentContextRef = useRef<string>('')
  const currentDocContextKey = useMemo(() => 
    JSON.stringify({
      title: documentContext.documentTitle,
      totalWords: documentContext.totalWords,
      // Exclude full document content to reduce unnecessary agent recreation
    }),
    [documentContext.documentTitle, documentContext.totalWords]
  )
  
  // Create LangChain document agent only when document context significantly changes
  const documentAgent = useMemo(() => {
    // If context hasn't meaningfully changed, don't recreate agent
    if (prevDocumentContextRef.current === currentDocContextKey) {
      return AIService.getExistingAgent() || AIService.createDocumentAgent(documentContext)
    }
    
    // Update ref and create new agent
    prevDocumentContextRef.current = currentDocContextKey
    return AIService.createDocumentAgent(documentContext)
  }, [documentContext, currentDocContextKey])
  
  // Save messages with debouncing
  const saveMessagesTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    // Clear any existing timeout
    if (saveMessagesTimeoutRef.current) {
      clearTimeout(saveMessagesTimeoutRef.current)
    }
    
    // Set a new timeout to save messages after 500ms of inactivity
    saveMessagesTimeoutRef.current = setTimeout(() => {
      // Prune messages if they exceed the maximum
      const prunedMessages = messages.length > MAX_MESSAGES
        ? messages.slice(-MAX_MESSAGES)
        : messages
        
      StorageService.saveMessages(prunedMessages)
    }, 500)
    
    // Clean up timeout on unmount
    return () => {
      if (saveMessagesTimeoutRef.current) {
        clearTimeout(saveMessagesTimeoutRef.current)
      }
    }
  }, [messages])
  
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
    )
  }, [messages])
  
  /**
   * Convert chat messages to LangChain message format
   */
  const getLangChainMessages = useCallback((): BaseMessage[] => {
    // Add system prompt first
    const result: BaseMessage[] = [
      new SystemMessage(SYSTEM_PROMPT.trim())
    ]
    
    // Then add conversation history
    return [
      ...result,
      ...getConversationMessages().map(msg => {
        if (msg.sender === 'user') {
          return new HumanMessage(msg.text)
        } else {
          return new AIMessage(msg.text)
        }
      })
    ]
  }, [getConversationMessages])
  
  /**
   * Convert chat messages to AI service format with document context using MCP
   * (Legacy format for API compatibility)
   */
  const getChatHistory = useCallback((documentContext: DocumentContext): ChatHistoryItem[] => {
    // Create the initial system prompt message
    const systemPromptMessage: ChatHistoryItem = {
      role: 'system',
      content: SYSTEM_PROMPT.trim()
    }
  
    // Convert existing messages to history
    const conversationHistory: ChatHistoryItem[] = getConversationMessages().map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))
  
    // Create structured document context message using MCP
    const documentContextMessage = AIService.getContextualPrompt(documentContext)
  
    return [systemPromptMessage, ...conversationHistory, documentContextMessage]
  }, [getConversationMessages])
  
  /**
   * Send a message to the AI service using LangChain
   */
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return
    
    setIsLoading(true)
    
    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, userMessage])
      
      // Prepare LangChain messages with limited history
      const chatHistory = getLangChainMessages().slice(-10) // Limit history to last 10 messages
      
      // Invoke the document agent with new message
      const response = await documentAgent.invoke({
        input: messageText,
        chat_history: chatHistory
      })
      
      // Create AI message from response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, aiMessage])
      return aiMessage
    } catch (error: any) {
      console.error('Error getting AI response:', error)
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Error: ${error.message || 'Failed to get AI response'}`,
        sender: 'system',
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, errorMessage])
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, documentAgent, getLangChainMessages])

  /**
   * Stream a message from the AI service with word-by-word updates
   * (Uses legacy API for now until LangChain streaming is implemented)
   */
  const streamMessage = useCallback((messageText: string, existingUserMessageId?: string) => {
    if (!messageText.trim() || isLoading) return
    
    setIsLoading(true)
    
    // Only add user message if we don't have an existing ID
    if (!existingUserMessageId) {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, userMessage])
    }
    
    // Create initial streaming message
    const streamMsg: ChatMessage = {
      id: (Date.now() + 2).toString(),
      text: '',
      sender: 'ai',
      timestamp: Date.now(),
      streaming: true
    }
    
    setStreamingMessage(streamMsg)
    
    // Use a local buffer for more efficient string building during streaming
    let textBuffer = ''
    
    // Get chat history with limited context
    const history = getChatHistory(documentContext)
    
    // Setup stream callbacks
    const handleChunk = (content: string) => {
      // Update buffer first (more efficient than string concatenation in setState)
      textBuffer += content
      
      // Update streaming message with full buffer content
      setStreamingMessage(prev => {
        if (!prev) return null
        return {
          ...prev,
          text: textBuffer
        }
      })
    }
    
    const handleComplete = () => {
      setStreamingMessage(prev => {
        if (!prev) return null
        
        // Process commands in the complete message
        const completeMessage = {
          ...prev,
          streaming: false
        }
        
        // Add to messages
        setMessages(messages => [...messages, completeMessage])
        setIsLoading(false)
        return null
      })
    }
    
    const handleError = (error: Error) => {
      console.error('Streaming error:', error)
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          text: `Error: ${error.message || 'Failed to get AI response'}`,
          sender: 'system',
          timestamp: Date.now()
        }
      ])
      setStreamingMessage(null)
      setIsLoading(false)
    }
    
    // Start streaming
    APIService.streamMessage(
      messageText,
      history,
      handleChunk,
      handleComplete,
      handleError
    )
  }, [isLoading, getChatHistory, documentContext])

  return {
    messages,
    setMessages,
    isLoading,
    streamingMessage,
    sendMessage,
    streamMessage,
    getChatHistory,
    documentAgent
  }
}