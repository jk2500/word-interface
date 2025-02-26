import { ContextProtocolService } from './contextProtocolService'
import { MetadataService } from './metadataService'
import { DocumentContext } from '../types/document'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { formatDocumentAsString } from '../utils/editor'

// Cache for reusing the document agent
let documentAgentCache: any = null

export interface ChatHistoryItem {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// System prompt that sets up the assistant's role and explains the MCP
export const SYSTEM_PROMPT = `You are a helpful AI assistant integrated into a document editor.
You are designed to help with writing, editing, formatting, and answering questions about the document.

Document context will be provided to you in a structured format. This format includes:
- Document metadata (title, creation date, last modified date, etc.)
- The full document content
- User's current selection or cursor position

When responding to the user, always refer to specific elements in the document context to provide personalized assistance.
For example, suggest improvements to their document, help with their selection, or reference the document title.

The user can issue these commands:
- /edit replace "old text" with "new text" - Edits document text directly
- /format - Shows current formatting information
- /analyze - Analyzes the document structure and style
- /help - Shows available commands
- /write - Lets you write content directly into the document at the cursor position

When the user asks you to write content for the document (like "write an introduction" or "add a conclusion"), you should:
1. Generate the content based on their request and the existing document
2. Use the /write command to output your content directly into the document
3. Format your response as: /write [Your generated content goes here]

The system will automatically insert your generated content into the document at the current cursor position.
Always provide concise, helpful responses that directly address the user's needs.`

// Initialize the LangChain ChatOpenAI model
const getModel = () => {
  // For React apps, environment variables need to be prefixed with REACT_APP_
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  
  if (!apiKey) {
    console.error('OpenAI API key is missing! Please set REACT_APP_OPENAI_API_KEY in your .env file');
  }
  
  return new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 4000,
    openAIApiKey: apiKey,
  });
}

export const AIService = {
  /**
   * Creates a proper MCP-formatted context message for the document
   * @param documentContext The current document context
   * @returns A ChatHistoryItem with the formatted context
   */
  getContextualPrompt(documentContext: DocumentContext): ChatHistoryItem {
    // Get full document metadata
    const metadata = MetadataService.load()
    
    try {
      // Parse document content from JSON string
      const documentContent = JSON.parse(documentContext.fullContent || '[]')
      
      // Create MCP using Anthropic's schema via the ContextProtocolService
      const mcp = ContextProtocolService.createAnthropicMCP(
        documentContent,
        metadata,
        {
          text: documentContext.selectedText || '',
          paragraph: '', // No longer using current paragraph
          position: documentContext.selectedText ? 
            (documentContext.fullDocument || '').indexOf(documentContext.selectedText) : 0
        }
      )
      
      // Format the context message using Claude's XML-style wrapper for tool use
      return {
        role: 'system',
        content: `<document_context>\n${mcp}\n</document_context>\n\nThe above is the current document context in MCP format. Use this information to provide relevant assistance to the user.`
      }
    } catch (error) {
      console.error('Error creating MCP:', error)
      
      // Fallback to simpler context format if JSON parsing fails
      return {
        role: 'system',
        content: `
        <document_context>
        {
          "type": "document_data",
          "metadata": {
            "title": "${metadata.title || 'Untitled Document'}",
            "updated_at": "${new Date(metadata.lastModified).toISOString()}"
          },
          "ui_state": {
            "current_selection": "${documentContext.selectedText || ''}",
            "full_document": "${documentContext.fullDocument || ''}",
            "cursor_position": null
          }
        }
        </document_context>
        
        This is the current document you're helping with. Please reference this context when providing assistance.`
      }
    }
  },

  /**
   * Gets an existing document agent if available
   * @returns Cached agent or null
   */
  getExistingAgent() {
    return documentAgentCache
  },
  
  /**
   * Creates and returns a LangChain document agent using the Anthropic model
   * @param documentContext The current document context
   * @returns A runnable LangChain chain for the document agent
   */
  createDocumentAgent(documentContext: DocumentContext) {
    // Get the model
    const model = getModel()
    
    // Create a prompt template for the document agent
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      new MessagesPlaceholder("chat_history"),
      ["system", "{document_context}"],
      ["human", "{input}"]
    ])
    
    // Create the agent chain with optimized context handling
    const chain = RunnableSequence.from([
      {
        input: new RunnablePassthrough(),
        chat_history: () => [], // This will be populated from useAIChat
        document_context: async () => {
          // Cache document context to avoid regenerating it for similar requests
          const contextKey = `${documentContext.documentTitle}-${documentContext.lastEdit.getTime()}`
          
          // Use cached context or generate new one
          const contextMessage = AIService.getContextualPrompt(documentContext)
          return contextMessage.content
        }
      },
      prompt,
      model,
      new StringOutputParser()
    ])
    
    // Cache the agent for reuse
    documentAgentCache = chain
    
    return chain
  },

  /**
   * Creates a specialized editor chain for text editing features
   * @returns A runnable LangChain chain for text editing
   */
  createEditorChain() {
    // Get the Anthropic model
    const model = getModel()
    
    // Create a prompt template for editing
    const editPrompt = ChatPromptTemplate.fromMessages([
      ["system", `You are an AI writing assistant that helps with text editing.
       You will be given a piece of text and instructions for how to edit it.
       Your task is to edit the text according to the instructions provided.
       Return ONLY the edited text, with no explanations, prefixes, or additional comments.
       Preserve paragraph structure, line breaks, and formatting as much as possible.`],
      ["human", `Here is the text to edit:
       
       ---
       {text}
       ---
       
       Instructions: {instruction}
       
       Please edit the text according to these instructions. Return only the edited text.`]
    ])
    
    // Create the editor chain
    const editChain = RunnableSequence.from([
      {
        text: (input: { text: string, instruction: string }) => input.text,
        instruction: (input: { text: string, instruction: string }) => input.instruction
      },
      editPrompt,
      model,
      new StringOutputParser()
    ])
    
    return editChain
  },
  
  /**
   * Gets an edited version of the selected text based on user instructions
   * @param selectedText The text to be edited
   * @param instruction User's editing instructions
   * @returns Promise with the edited text
   */
  async getEditing(selectedText: string, instruction: string): Promise<string> {
    try {
      // Create and use the editor chain
      const editChain = this.createEditorChain()
      
      // Invoke the chain with the text and instruction
      const result = await editChain.invoke({
        text: selectedText,
        instruction: instruction
      })
      
      return result
    } catch (error) {
      console.error('Error in getEditing:', error)
      throw error
    }
  }
}