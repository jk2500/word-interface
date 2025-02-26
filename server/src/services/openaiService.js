const openai = require('../config/openai')
const { SYSTEM_PROMPT } = require('../constants/prompts')

const openaiService = {
  async createChatCompletion(message, history) {
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
  },

  async createStreamingChatCompletion(message, history) {
    const stream = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message }
      ],
      model: 'gpt-4o-mini',
      stream: true
    })

    return stream
  },
  
  async createEditCompletion(messages) {
    // Use a faster model for edits for better responsiveness
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      temperature: 0.7,
      store: true
    })

    return completion.choices[0].message.content
  }
}

module.exports = openaiService 