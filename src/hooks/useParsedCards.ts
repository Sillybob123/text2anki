import { useEffect, useState } from 'react'
import { parseCards } from '../lib/parser'
import type { NoteType, ParsedCard } from '../types'

export function useParsedCards(text: string, noteType: NoteType) {
  const [cards, setCards] = useState<ParsedCard[]>([])
  const [strategy, setStrategy] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = parseCards(text, noteType)
      setCards(result.cards)
      setStrategy(result.strategy)
    }, 150)
    return () => clearTimeout(timer)
  }, [text, noteType])

  return { cards, strategy }
}
