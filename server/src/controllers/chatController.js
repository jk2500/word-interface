const openaiService = require('../services/openaiService')

const chatController = {
  async handleChat(req, res) {
    try {
      const { message, history } = req.body
      console.log('Received message:', message)
      console.log('Chat history:', history)
      
      const response = await openaiService.createChatCompletion(message, history)
      res.json({ message: response })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: error.message || 'Internal Server Error' })
    }
  }
}

module.exports = chatController 