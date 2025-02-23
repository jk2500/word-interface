import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'

export type CustomElement = {
  type: 'paragraph' | 'heading' | 'list-item'
  children: CustomText[]
}

export type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export type CustomEditor = BaseEditor & ReactEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
} 