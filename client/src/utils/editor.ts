import { Descendant, Node as SlateNode, Editor } from 'slate'

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