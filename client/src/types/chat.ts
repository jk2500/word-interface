import { RunnableSequence } from '@langchain/core/runnables'

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai' | 'system'
  timestamp: number
  streaming?: boolean // Whether this message is currently streaming
}

export interface ChatHistoryItem {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIChat {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  isLoading: boolean
  documentAgent: RunnableSequence<any, string>
  sendMessage: (text: string) => Promise<ChatMessage | undefined>
}

// Use constants object for chat commands to avoid duplication
export const CHAT_COMMANDS = {
  FORMAT: "/format",
  HELP: "/help",
  EDIT: "/edit",
  ANALYZE: "/analyze",
  WRITE: "/write",
  INSERT: "/insert",
  REPLACE: "/replace"
} as const;

export interface ChatCommands {
  handleCommand: (command: string, args: string) => string | null
  executeWithAgent: (agent: any, commandText: string, chatHistory?: any[]) => Promise<string>
  COMMANDS: typeof CHAT_COMMANDS
}