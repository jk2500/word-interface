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
  },

  async handleStreamingChat(req, res) {
    try {
      const { message, history } = req.body
      console.log('Received streaming message:', message)
      
      // Set headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })

      // Send initial event to confirm connection
      res.write('event: connected\ndata: {}\n\n')
      
      const stream = await openaiService.createStreamingChatCompletion(message, history)
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          // Send each piece of content as an SSE event
          res.write(`event: message\ndata: ${JSON.stringify({ content })}\n\n`)
        }
      }
      
      // Send complete event to signal end of response
      res.write('event: complete\ndata: {}\n\n')
      res.end()
    } catch (error) {
      console.error('Streaming Error:', error)
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message || 'Internal Server Error' })}\n\n`)
      res.end()
    }
  }
}

module.exports = chatController 