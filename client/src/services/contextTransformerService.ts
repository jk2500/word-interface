import { DocumentContext } from '../types/document';
import { ContextProtocolService } from './contextProtocolService';
import { MetadataService } from './metadata';
import { BaseMessage, SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

/**
 * Service for transforming document context into various formats
 */
export class ContextTransformerService {
  /**
   * Transforms document context to MCP format
   */
  static toMCP(documentContext: DocumentContext, includeMetadata = true): string {
    const metadata = includeMetadata ? MetadataService.load() : null;
    
    try {
      const documentContent = JSON.parse(documentContext.fullContent || '[]');
      return ContextProtocolService.createAnthropicMCP(
        documentContent,
        metadata,
        {
          text: documentContext.selectedText || '',
          paragraph: documentContext.currentParagraph || '',
          position: documentContext.selectedText ? 
            (documentContext.fullDocument || '').indexOf(documentContext.selectedText) : 0
        }
      );
    } catch (error) {
      console.error('Error creating MCP:', error);
      return this.createFallbackContext(documentContext, metadata);
    }
  }
  
  /**
   * Transforms document context to LangChain messages
   */
  static toLangChainMessages(
    documentContext: DocumentContext, 
    chatHistory: BaseMessage[] = []
  ): BaseMessage[] {
    const contextMessage = new SystemMessage(
      `<document_context>\n${this.toMCP(documentContext)}\n</document_context>`
    );
    
    return [contextMessage, ...chatHistory];
  }
  
  /**
   * Creates a fallback context when MCP creation fails
   */
  private static createFallbackContext(documentContext: DocumentContext, metadata: any): string {
    return JSON.stringify({
      type: "document_data",
      metadata: {
        title: metadata?.title || documentContext.documentTitle || 'Untitled Document',
        updated_at: new Date().toISOString()
      },
      ui_state: {
        current_selection: documentContext.selectedText || '',
        full_document: documentContext.fullDocument || '',
        cursor_position: null
      }
    }, null, 2);
  }
}