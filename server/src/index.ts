import express from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat'
import { config } from './config'

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
}) 