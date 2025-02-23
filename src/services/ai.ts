import OpenAI from 'openai'

const openai = new OpenAI({
  organization: "org-lwzZIzoUZplW9yfTX1R9nmTx",
  project: process.env.REACT_APP_PROJECT_ID
})

export type ChatHistoryItem = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `You are a helpful AI assistant integrated into a document editor. 
You can help with writing, editing, and answering questions about the document.
Keep your responses clear and concise.`

export const AIService = {
  async sendMessage(message: string, history: ChatHistoryItem[] = []) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: message }
        ],
        model: 'gpt-4o-mini',
        store: true
      })

      return completion.choices[0].message.content
    } catch (error: any) {
      console.error('Error calling OpenAI:', error)
      throw new Error(error.message || 'Failed to get AI response')
    }
  }
} 