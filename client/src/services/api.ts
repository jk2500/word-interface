import { ChatHistoryItem } from './ai'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

export const APIService = {
  async sendMessage(message: string, history: ChatHistoryItem[] = []) {
    console.log('APIService - Sending Message:', message)
    console.log('APIService - Sending History:', history)
    
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
      console.log('APIService - Received Response:', data)
      return data.message
    } catch (error: any) {
      console.error('APIService - Error:', error)
      throw new Error(error.message || 'Failed to get AI response')
    }
  }
}

// ... rest of the file remains the same 