import { ChatHistoryItem } from './ai'
import { debounce } from 'lodash'

const TIMEOUT_MS = 10000 // 10 second timeout
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

export const APIService = {
  async sendMessage(message: string, history: ChatHistoryItem[] = []) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      return data.message
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw new Error(error.message || 'Failed to get AI response')
    }
  }
}

// ... rest of the file remains the same 