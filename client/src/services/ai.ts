// Remove the OpenAI import and initialization
// import OpenAI from 'openai'

export interface ChatHistoryItem {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const SYSTEM_PROMPT = `You are a helpful AI assistant integrated into a document editor. 
You can help with writing, editing, and answering questions about the document.
Keep your responses clear and concise.

You have access to the following document context:
- Selected text
- Current paragraph
- Total word count
- Current formatting
- Document title
- Last edit timestamp

Use this context to provide more relevant assistance.`

// Remove direct OpenAI integration - we'll use the API service instead
export const AIService = {
  async sendMessage(message: string, history: ChatHistoryItem[] = []) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/chat`, {
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