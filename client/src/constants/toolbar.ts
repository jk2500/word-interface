export const ALIGNMENT_ICONS = {
  left: '⫷',
  center: '⚌',
  right: '⫸'
} as const

export type Alignment = keyof typeof ALIGNMENT_ICONS

export const FONT_OPTIONS = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica'
] as const

export type FontOption = typeof FONT_OPTIONS[number] 