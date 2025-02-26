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
  },
  
  // Stream a message with Server-Sent Events
  streamMessage(
    message: string, 
    history: ChatHistoryItem[] = [], 
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) {
    // Create a POST request to the streaming endpoint
    fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      // Create an event source from the response
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      // Process the stream
      return new ReadableStream({
        start(controller) {
          function push() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close()
                onComplete()
                return
              }
              
              // Decode the chunk and add to buffer
              buffer += decoder.decode(value, { stream: true })
              
              // Process complete SSE events
              const events = buffer.split('\n\n')
              
              // Keep the last incomplete event in the buffer
              buffer = events.pop() || ''
              
              for (const event of events) {
                if (event.startsWith('event: message')) {
                  try {
                    const dataLine = event.split('\n')[1]
                    if (dataLine && dataLine.startsWith('data: ')) {
                      const jsonData = JSON.parse(dataLine.slice(6))
                      if (jsonData.content) {
                        onChunk(jsonData.content)
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing SSE message:', e)
                  }
                } else if (event.startsWith('event: error')) {
                  try {
                    const dataLine = event.split('\n')[1]
                    if (dataLine && dataLine.startsWith('data: ')) {
                      const errorData = JSON.parse(dataLine.slice(6))
                      onError(new Error(errorData.error))
                    }
                  } catch (e) {
                    console.error('Error parsing SSE error:', e)
                  }
                }
              }
              
              push()
            }).catch(err => {
              controller.error(err)
              onError(err)
            })
          }
          
          push()
        }
      })
    }).catch(error => {
      onError(error)
    })
  }
}

// ... rest of the file remains the same 