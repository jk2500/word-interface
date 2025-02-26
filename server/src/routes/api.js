const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const editController = require('../controllers/editController')

// Chat endpoints
router.post('/chat', chatController.handleChat)
router.post('/chat/stream', chatController.handleStreamingChat)

// Edit endpoint
router.post('/edit', editController.handleEdit)

module.exports = router 