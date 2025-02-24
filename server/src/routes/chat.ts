import { Router } from 'express'
import openai from '../config/openai'

const router = Router()

// Add request caching
const messageCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

router.post('/', async (req, res) => {
  const { message, history } = req.body
  
  // Generate cache key from message and last context
  const cacheKey = JSON.stringify({
    message,
    lastContext: history[history.length - 1]?.content
  })

  // Check cache first
  if (messageCache.has(cacheKey)) {
    return res.json({ message: messageCache.get(cacheKey) })
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [...history, { role: 'user', content: message }],
      model: 'gpt-4o-mini',
      max_tokens: 150, // Limit response length
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    })

    const response = completion.choices[0].message.content

    // Cache the response
    messageCache.set(cacheKey, response)
    setTimeout(() => messageCache.delete(cacheKey), CACHE_TTL)

    res.json({ message: response })
  } catch (error: any) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: error.message })
  }
})

export const chatRouter = router 