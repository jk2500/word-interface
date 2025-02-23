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
      model: 'gpt-4',
      store: true
    })

    return completion.choices[0].message.content
  }
}

module.exports = openaiService 