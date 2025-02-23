import { ChatHistoryItem } from './ai'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

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

// ... rest of the file remains the same 