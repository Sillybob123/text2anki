export type NoteType = 'Basic' | 'Cloze+' | 'Cloze++'

export interface ParsedCard {
  front: string
  back: string
  noteType: NoteType
  hash?: string
}

export interface ParseResult {
  cards: ParsedCard[]
  confidence: number
  strategy: string
}

export interface CardHash {
  front: string
  back: string
  deckId: string
  noteType: NoteType
  addedAt: Date
}

export interface UserProfile {
  displayName: string
  email: string
  createdAt: Date
  lastActiveAt: Date
}
