import { Descendant, Node as SlateNode, Editor, Transforms, Range, Path, Element, Text, NodeEntry } from 'slate'

export const getCurrentParagraph = (selection: Selection): string => {
  const node = selection.anchorNode
  if (!node) return ''
  
  // Get the paragraph containing the selection
  let paragraph: ParentNode | null = node as ParentNode
  while (paragraph && (paragraph as HTMLElement).nodeName !== 'P') {
    paragraph = paragraph.parentNode
    if (!paragraph) break
  }
  
  return (paragraph as HTMLElement)?.textContent || ''
}

export const getCurrentParagraphText = (editor: Editor): string => {
  const { selection } = editor
  if (!selection) return ''

  const [node] = Editor.node(editor, selection)
  return SlateNode.string(node)
}

export const countWords = (nodes: Descendant[]): number => {
  return nodes.reduce((count, node) => {
    if (SlateNode.string(node)) {
      return count + SlateNode.string(node).split(/\s+/).filter(Boolean).length
    }
    return count
  }, 0)
}

/**
 * Format the document content as a readable string for LLM consumption
 * @param nodes The document nodes
 * @returns Formatted document string
 */
export const formatDocumentAsString = (nodes: Descendant[]): string => {
  let documentText = ''
  
  // Process each node to build the document text
  nodes.forEach((node, index) => {
    if (Element.isElement(node)) {
      // Handle different element types
      switch (node.type) {
        case 'paragraph':
          // Add paragraph text
          documentText += node.children
            .map(child => Text.isText(child) ? child.text : '')
            .join('')
          
          // Add newlines between paragraphs
          if (index < nodes.length - 1) {
            documentText += '\n\n'
          }
          break
          
        case 'heading':
          // Add heading with emphasis
          documentText += node.children
            .map(child => Text.isText(child) ? child.text : '')
            .join('')
          
          // Add newlines after headings
          documentText += '\n\n'
          break
          
        case 'list-item':
          // Format list items
          documentText += '• ' + node.children
            .map(child => Text.isText(child) ? child.text : '')
            .join('')
          
          // Add newline after list items
          documentText += '\n'
          break
          
        default:
          // Default handling for other element types
          documentText += node.children
            .map(child => Text.isText(child) ? child.text : '')
            .join('')
          
          // Add newline
          if (index < nodes.length - 1) {
            documentText += '\n'
          }
      }
    } else if (Text.isText(node)) {
      // Handle direct text nodes (rare in Slate)
      documentText += node.text
      
      if (index < nodes.length - 1) {
        documentText += '\n'
      }
    }
  })
  
  return documentText
}

/**
 * Find and replace text in the editor document
 * @param editor Slate editor instance
 * @param searchText Text to search for
 * @param replaceText Text to replace with
 * @returns boolean indicating if replacement was performed
 */
export const findAndReplaceText = (
  editor: Editor,
  searchText: string,
  replaceText: string
): boolean => {
  if (!searchText || searchText === replaceText) return false
  
  let replacementPerformed = false;
  
  // First try to replace in the selected text
  if (editor.selection && !Range.isCollapsed(editor.selection)) {
    const selectedText = Editor.string(editor, editor.selection)
    if (selectedText.includes(searchText)) {
      // Replace text in the current selection
      Transforms.delete(editor)
      Transforms.insertText(editor, selectedText.replace(searchText, replaceText))
      replacementPerformed = true
      return replacementPerformed;
    }
  }
  
  // Search through the entire document for matches
  const nodeEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      match: n => Text.isText(n),
    })
  );
  
  for (const [node, path] of nodeEntries) {
    if (Text.isText(node)) {
      const textContent = node.text;
      const index = textContent.indexOf(searchText);
      
      if (index !== -1) {
        // Found a match, perform the replacement
        const rangeStart = { path, offset: index };
        const rangeEnd = { path, offset: index + searchText.length };
        
        // Create a range for the matching text
        const range = { anchor: rangeStart, focus: rangeEnd };
        
        // Select the range
        Transforms.select(editor, range);
        
        // Replace the text
        Transforms.delete(editor);
        Transforms.insertText(editor, replaceText);
        
        // Scroll the selection into view for visual feedback
        setTimeout(() => {
          const domSelection = window.getSelection();
          if (domSelection?.rangeCount) {
            domSelection.getRangeAt(0).startContainer.parentElement?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 50);
        
        replacementPerformed = true;
        break;
      }
    }
  }
  
  return replacementPerformed
}

/**
 * Parse edit command arguments to extract search and replacement text
 * @param args The command arguments string
 * @returns Object with oldText and newText properties
 */
export const parseEditCommand = (args: string): { oldText: string, newText: string } | null => {
  // Support formats like:
  // /edit replace "old text" with "new text"
  // /edit "old text" to "new text"
  
  // Try the "replace X with Y" format
  let match = args.match(/replace\s+["'](.+?)["']\s+with\s+["'](.+?)["']/i)
  if (match) {
    return {
      oldText: match[1],
      newText: match[2]
    }
  }
  
  // Try the "X to Y" format
  match = args.match(/["'](.+?)["']\s+to\s+["'](.+?)["']/i)
  if (match) {
    return {
      oldText: match[1],
      newText: match[2]
    }
  }
  
  // Try basic format with quotes
  match = args.match(/["'](.+?)["']\s+["'](.+?)["']/i)
  if (match) {
    return {
      oldText: match[1],
      newText: match[2]
    }
  }
  
  return null
} 