import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { NoteType } from '../types'

export async function ensureUserProfile(
  uid: string,
  displayName: string,
  email: string
): Promise<void> {
  const profileRef = doc(db, 'users', uid, 'profile', 'data')
  const snap = await getDoc(profileRef)
  if (!snap.exists()) {
    await setDoc(profileRef, {
      displayName,
      email,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    })
  } else {
    await setDoc(profileRef, { lastActiveAt: serverTimestamp() }, { merge: true })
  }
}

export async function loadExistingHashes(uid: string): Promise<Set<string>> {
  const hashesRef = collection(db, 'users', uid, 'cardHashes')
  const snap = await getDocs(hashesRef)
  const set = new Set<string>()
  snap.forEach(d => set.add(d.id))
  return set
}

export async function saveNewHashes(
  uid: string,
  cards: Array<{ hash: string; front: string; back: string; noteType: NoteType; deckId: string }>
): Promise<void> {
  if (cards.length === 0) return

  const batch = writeBatch(db)
  for (const card of cards) {
    const hashRef = doc(db, 'users', uid, 'cardHashes', card.hash)
    batch.set(hashRef, {
      front: card.front.slice(0, 120),
      back: card.back.slice(0, 120),
      deckId: card.deckId,
      noteType: card.noteType,
      addedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}
