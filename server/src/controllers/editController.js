const openaiService = require('../services/openaiService')

const editController = {
  async handleEdit(req, res) {
    try {
      const { messages } = req.body
      console.log('Received edit request with instructions')
      
      if (!messages || !Array.isArray(messages) || messages.length < 2) {
        return res.status(400).json({ 
          error: 'Invalid request format. Messages array required with system and user messages.' 
        })
      }
      
      const editedText = await openaiService.createEditCompletion(messages)
      res.json({ editedText })
    } catch (error) {
      console.error('Error handling edit:', error)
      res.status(500).json({ error: error.message || 'Internal Server Error' })
    }
  }
}

module.exports = editController