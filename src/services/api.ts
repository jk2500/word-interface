import { ChatHistoryItem } from './ai'  // Verify this path is correct relative to api.ts

const API_BASE_URL = 'http://localhost:3001/api'  // Your backend server URL

export const APIService = {
  async sendMessage(message: string, history: ChatHistoryItem[] = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history
        })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      return data.message
    } catch (error: any) {
      console.error('Error calling API:', error)
      throw new Error(error.message || 'Failed to get AI response')
    }
  }
} 