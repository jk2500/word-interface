export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai' | 'system'
  timestamp: number
}

export interface ChatHistoryItem {
  role: 'system' | 'user' | 'assistant'
  content: string
} 