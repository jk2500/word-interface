// Remove the OpenAI import and initialization
// import OpenAI from 'openai'

export type ChatHistoryItem = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const SYSTEM_PROMPT = `You are a helpful AI assistant integrated into a document editor. 
You can help with writing, editing, and answering questions about the document.
Keep your responses clear and concise.` 