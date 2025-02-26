import { DocumentMetadata } from '../types/document'
import { Descendant, Element, Text } from 'slate'

/**
 * Service for implementing Anthropic's Model Context Protocol (MCP)
 * This formats document data into a structured format that the AI can understand
 */
export class ContextProtocolService {
  // Maximum length for document content to avoid token limits
  private static MAX_CONTENT_LENGTH = 16000
  
  /**
   * Creates an MCP object according to Anthropic's schema
   * @param document The Slate document nodes
   * @param metadata Document metadata
   * @param selection Current selection information
   * @returns Formatted MCP JSON string
   */
  static createAnthropicMCP(
    document: Descendant[],
    metadata: DocumentMetadata,
    selection: {
      text: string,
      paragraph: string,
      position?: number
    }
  ): string {
    // Format entire document content as plain text
    const plainTextContent = this.getPlainText(document)
    
    // Create document structure information
    const structure = this.analyzeDocumentStructure(document)
    
    // Create MCP object according to Anthropic's schema
    const mcp = {
      type: "document_data",
      version: "0.0.1",
      metadata: {
        title: metadata.title || "Untitled Document",
        id: metadata.id,
        created_at: new Date(metadata.createdAt).toISOString(),
        updated_at: new Date(metadata.lastModified).toISOString(),
        document_version: metadata.version.toString(),
        total_paragraphs: structure.paragraphCount,
        total_words: structure.wordCount
      },
      content: {
        // Always include full document content, truncating only if absolutely necessary
        text: this.truncateText(plainTextContent, this.MAX_CONTENT_LENGTH),
        format: "text/plain"
      },
      ui_state: {
        current_selection: selection.text || null,
        cursor_position: selection.position || null
      },
      structure: {
        paragraphs: structure.paragraphCount,
        sections: structure.sectionCount,
        has_title: structure.hasTitle,
        has_lists: structure.hasLists
      }
    }

    return JSON.stringify(mcp, null, 2)
  }

  /**
   * Analyzes document structure to provide more context to the AI
   * @param nodes The document nodes
   * @returns Structure information
   */
  private static analyzeDocumentStructure(nodes: Descendant[]): {
    paragraphCount: number, 
    sectionCount: number,
    wordCount: number,
    hasTitle: boolean,
    hasLists: boolean
  } {
    let paragraphCount = 0
    let sectionCount = 0
    let wordCount = 0
    let hasLists = false
    
    // Consider first non-empty paragraph as potential title if it's short
    const firstParagraph = nodes.find(node => {
      if (Element.isElement(node) && node.children) {
        const text = node.children
          .filter(child => Text.isText(child))
          .map(child => (child as Text).text)
          .join('')
        return text.trim().length > 0
      }
      return false
    })
    
    const hasTitle = firstParagraph ? this.isPotentialTitle(firstParagraph) : false
    
    // Analyze each node
    nodes.forEach(node => {
      if (Element.isElement(node)) {
        // Count paragraphs
        if (node.type === 'paragraph' || !node.type) {
          paragraphCount++
          
          // Count words in paragraph
          if (node.children) {
            const text = node.children
              .filter(child => Text.isText(child))
              .map(child => (child as Text).text)
              .join('')
            
            wordCount += text.split(/\s+/).filter(Boolean).length
          }
        }
        
        // Detect lists
        if ((node.type === 'paragraph' && node.children && 
             node.children[0] && Text.isText(node.children[0]) && 
             /^[•\-*\d]+[\.\)]\s/.test(node.children[0].text))) {
          hasLists = true
        }
        
        // Detect potential section headers
        if (this.isPotentialHeading(node)) {
          sectionCount++
        }
      }
    })
    
    return {
      paragraphCount,
      sectionCount,
      wordCount,
      hasTitle,
      hasLists
    }
  }
  
  /**
   * Determines if a node is likely a heading/title
   * @param node The node to check
   * @returns True if it looks like a heading
   */
  private static isPotentialHeading(node: Element): boolean {
    if (!node.children || node.children.length === 0) return false
    
    const nodeText = node.children
      .filter(child => Text.isText(child))
      .map(child => (child as Text).text)
      .join('')
    
    // Check if it's short, doesn't end with punctuation, or has formatting that suggests a header
    const isShort = nodeText.length < 100
    const lacksEndPunctuation = !/[.!?;:]$/.test(nodeText.trim())
    const hasHeaderFormatting = node.type === 'heading'
    
    return isShort && (lacksEndPunctuation || hasHeaderFormatting)
  }
  
  /**
   * Determines if a node is likely a document title
   * @param node The node to check
   * @returns True if it looks like a title
   */
  private static isPotentialTitle(node: Element | Text): boolean {
    if (Text.isText(node)) return false
    
    if (!node.children || node.children.length === 0) return false
    
    const nodeText = node.children
      .filter(child => Text.isText(child))
      .map(child => (child as Text).text)
      .join('')
    
    // Title usually short, centered, possibly formatted differently
    return nodeText.length < 70
  }

  /**
   * Extracts plain text from Slate nodes
   * @param nodes The document nodes
   * @returns Plain text representation
   */
  private static getPlainText(nodes: Descendant[]): string {
    return nodes.map(node => {
      // If it's an element with children
      if (Element.isElement(node) && node.children) {
        // Process children nodes and join their text
        return node.children
          .map(child => {
            // If child is a text node, return its text
            if (Text.isText(child)) {
              return child.text
            }
            return ''
          })
          .join('')
      }
      // If it's a text node, return its text
      if (Text.isText(node)) {
        return node.text
      }
      // Fallback
      return ''
    }).join('\n')
  }

  /**
   * Truncates text while preserving document structure
   * @param text The text to truncate
   * @param maxLength Maximum allowed length
   * @returns Truncated text
   */
  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    
    // More sophisticated truncation that preserves document structure
    const halfLength = Math.floor(maxLength / 2) - 100
    const start = text.substring(0, halfLength)
    const end = text.substring(text.length - halfLength)
    
    return `${start}\n\n...[content truncated for brevity]...\n\n${end}`
  }
}