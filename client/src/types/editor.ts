import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { Alignment } from '../constants/toolbar'

export type CustomElement = {
  type: 'paragraph' | 'heading' | 'list-item'
  align?: Alignment
  children: CustomText[]
}

export type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  font?: string
}

export type CustomEditor = BaseEditor & ReactEditor & {
  currentFont: string
  currentFormats: {
    bold: boolean
    italic: boolean
    underline: boolean
  }
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

// Common fonts that are generally available
export const FONT_OPTIONS = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica'
] as const

export type FontOption = typeof FONT_OPTIONS[number] 