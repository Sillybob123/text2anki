import type { NoteType } from '../types'

export async function hashCard(
  front: string,
  back: string,
  noteType: NoteType
): Promise<string> {
  const input = noteType + '\x1f' + front.trim().toLowerCase() + '\x1f' + back.trim().toLowerCase()
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function sha1Int(text: string): Promise<number> {
  const encoded = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoded)
  const view = new DataView(hashBuffer)
  return view.getInt32(0, false)
}
