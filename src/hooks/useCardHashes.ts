import { useEffect, useState, useCallback } from 'react'
import { loadExistingHashes, saveNewHashes } from '../lib/firestore'
import { hashCard } from '../lib/hasher'
import type { ParsedCard } from '../types'
import type { User } from 'firebase/auth'

export function useCardHashes(user: User | null) {
  const [existingHashes, setExistingHashes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setExistingHashes(new Set())
      return
    }
    setLoading(true)
    loadExistingHashes(user.uid)
      .then(setExistingHashes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const filterAndSave = useCallback(
    async (cards: ParsedCard[], deckId: string): Promise<{ newCards: ParsedCard[]; dupCount: number }> => {
      if (!user) return { newCards: cards, dupCount: 0 }

      const withHashes = await Promise.all(
        cards.map(async (card) => ({
          ...card,
          hash: await hashCard(card.front, card.back, card.noteType),
        }))
      )

      const newCards = withHashes.filter(c => !existingHashes.has(c.hash!))
      const dupCount = cards.length - newCards.length

      if (newCards.length > 0) {
        await saveNewHashes(
          user.uid,
          newCards.map(c => ({
            hash: c.hash!,
            front: c.front,
            back: c.back,
            noteType: c.noteType,
            deckId,
          }))
        )
        setExistingHashes(prev => {
          const next = new Set(prev)
          newCards.forEach(c => next.add(c.hash!))
          return next
        })
      }

      return { newCards, dupCount }
    },
    [user, existingHashes]
  )

  return { existingHashes, loading, filterAndSave }
}
