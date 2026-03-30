import JSZip from 'jszip'
import type { ParsedCard } from '../types'
import { getModel } from './ankiModels'
import { sha1Int } from './hasher'

// Dynamically import sql.js so it only loads when needed
async function loadSQL() {
  const initSqlJs = (await import('sql.js')).default
  return initSqlJs({ locateFile: () => './sql-wasm.wasm' })
}

function base91Encode(n: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~'
  let result = ''
  let num = Math.abs(n) + 1
  while (num > 0) {
    result = chars[num % 91] + result
    num = Math.floor(num / 91)
  }
  return result || chars[0]
}

function countClozeOrds(text: string): number[] {
  const matches = [...text.matchAll(/\{\{c(\d+)::/g)]
  const ords = new Set(matches.map(m => parseInt(m[1]) - 1))
  return [...ords].sort((a, b) => a - b)
}

export async function generateApkg(
  cards: ParsedCard[],
  deckName: string
): Promise<Blob> {
  const SQL = await loadSQL()
  const db = new SQL.Database()

  // Create Anki 2.1 schema
  db.run(`
    CREATE TABLE col (
      id INTEGER PRIMARY KEY,
      crt INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      scm INTEGER NOT NULL,
      ver INTEGER NOT NULL,
      dty INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      ls INTEGER NOT NULL,
      conf TEXT NOT NULL,
      models TEXT NOT NULL,
      decks TEXT NOT NULL,
      dconf TEXT NOT NULL,
      tags TEXT NOT NULL
    );

    CREATE TABLE notes (
      id INTEGER PRIMARY KEY,
      guid TEXT NOT NULL,
      mid INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      tags TEXT NOT NULL,
      flds TEXT NOT NULL,
      sfld INTEGER NOT NULL,
      csum INTEGER NOT NULL,
      flags INTEGER NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE cards (
      id INTEGER PRIMARY KEY,
      nid INTEGER NOT NULL,
      did INTEGER NOT NULL,
      ord INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      type INTEGER NOT NULL,
      queue INTEGER NOT NULL,
      due INTEGER NOT NULL,
      ivl INTEGER NOT NULL,
      factor INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      lapses INTEGER NOT NULL,
      left INTEGER NOT NULL,
      odue INTEGER NOT NULL,
      odid INTEGER NOT NULL,
      flags INTEGER NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE revlog (
      id INTEGER PRIMARY KEY,
      cid INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      ease INTEGER NOT NULL,
      ivl INTEGER NOT NULL,
      lastIvl INTEGER NOT NULL,
      factor INTEGER NOT NULL,
      time INTEGER NOT NULL,
      type INTEGER NOT NULL
    );

    CREATE TABLE graves (
      usn INTEGER NOT NULL,
      oid INTEGER NOT NULL,
      type INTEGER NOT NULL
    );
  `)

  const now = Math.floor(Date.now() / 1000)
  const deckId = Date.now()

  // Determine note type from first card (all cards share the same type in a single export)
  const noteType = cards[0]?.noteType ?? 'Basic'
  const model = getModel(noteType)
  const modelId = model.id

  const defaultDeck = {
    id: 1,
    name: 'Default',
    conf: 1,
    desc: '',
    dyn: 0,
    collapsed: false,
    childDecks: [],
    extendNew: 10,
    extendRev: 50,
    mod: now,
    usn: -1,
  }

  const exportDeck = {
    id: deckId,
    name: deckName,
    conf: 1,
    desc: '',
    dyn: 0,
    collapsed: false,
    childDecks: [],
    extendNew: 10,
    extendRev: 50,
    mod: now,
    usn: -1,
  }

  const defaultDconf = {
    1: {
      id: 1,
      name: 'Default',
      replayq: true,
      lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 },
      rev: { bury: false, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 100 },
      new: { bury: false, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20, separate: true },
      maxTaken: 60,
      timer: 0,
      autoplay: true,
      mod: now,
      usn: -1,
    },
  }

  db.run(
    `INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      now,
      now,
      Date.now(),
      11,
      0,
      0,
      0,
      JSON.stringify({ activeDecks: [deckId], curDeck: deckId, newSpread: 0, collapseTime: 1200, timeLim: 0, estTimes: true, dueCounts: true, curModel: modelId, nextPos: 1, sortType: 'noteFld', sortBackwards: false }),
      JSON.stringify({ [modelId]: { ...model, id: modelId } }),
      JSON.stringify({ 1: defaultDeck, [deckId]: exportDeck }),
      JSON.stringify(defaultDconf),
      '{}',
    ]
  )

  // Insert notes and cards
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    const noteId = deckId + i + 1
    const cardIdBase = noteId * 1000
    const guid = base91Encode(noteId)
    const flds = card.front + '\x1f' + card.back
    const sfld = card.front
    const csum = await sha1Int(card.front)
    const modTime = now + i

    db.run(
      `INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [noteId, guid, modelId, modTime, -1, '', flds, sfld, csum, 0, '']
    )

    if (noteType === 'Basic') {
      db.run(
        `INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cardIdBase, noteId, deckId, 0, modTime, -1, 0, 0, i + 1, 0, 0, 0, 0, 0, 0, 0, 0, '']
      )
    } else {
      // Cloze: one card per {{cN::}} occurrence
      const ords = countClozeOrds(card.front)
      if (ords.length === 0) ords.push(0)
      for (const ord of ords) {
        db.run(
          `INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [cardIdBase + ord, noteId, deckId, ord, modTime, -1, 0, 0, i + 1, 0, 0, 0, 0, 0, 0, 0, 0, '']
        )
      }
    }
  }

  const dbData = db.export()
  db.close()

  const zip = new JSZip()
  zip.file('collection.anki21', dbData)
  zip.file('media', '{}')

  return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' })
}
