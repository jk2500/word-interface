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
  streamingMessage: ChatMessage | null
  sendMessage: (messageText: string) => Promise<ChatMessage | undefined>
  streamMessage: (messageText: string, existingUserMessageId?: string) => void
  getChatHistory: (documentContext: any) => ChatHistoryItem[]
  documentAgent: any
}

export interface ChatCommands {
  handleCommand: (command: string, args: string) => string | null
  executeWithAgent: (agent: any, commandText: string) => Promise<string>
  COMMANDS: {
    readonly FORMAT: "/format"
    readonly HELP: "/help"
    readonly EDIT: "/edit"
    readonly ANALYZE: "/analyze"
    readonly WRITE: "/write"
  }
} 