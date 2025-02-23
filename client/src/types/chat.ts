export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai' | 'system'
  timestamp: number
} 