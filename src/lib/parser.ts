import type { NoteType, ParsedCard, ParseResult } from '../types'

interface Strategy {
  name: string
  parse: (text: string, noteType: NoteType) => ParsedCard[]
}

function cleanText(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

// Strategy 1: Q:/A: or Question:/Answer: or Front:/Back:
const labeledPairStrategy: Strategy = {
  name: 'labeled-pairs',
  parse(text, noteType) {
    const cards: ParsedCard[] = []
    const frontPattern = /^(q(?:uestion)?|front)\s*:\s*/im
    const backPattern = /^(a(?:nswer)?|back)\s*:\s*/im

    const blocks = text.split(/\n{2,}/).filter(b => b.trim())
    for (const block of blocks) {
      const lines = block.split('\n')
      let front = ''
      let back = ''
      let mode: 'front' | 'back' | 'none' = 'none'

      for (const line of lines) {
        if (frontPattern.test(line)) {
          front = line.replace(frontPattern, '')
          mode = 'front'
        } else if (backPattern.test(line)) {
          back = line.replace(backPattern, '')
          mode = 'back'
        } else if (mode === 'front') {
          front += ' ' + line
        } else if (mode === 'back') {
          back += ' ' + line
        }
      }

      front = cleanText(front)
      back = cleanText(back)
      if (front && back) cards.push({ front, back, noteType })
    }

    // Also try single-line labeled pairs
    if (cards.length === 0) {
      const singleLineRegex = /^(q(?:uestion)?|front)\s*:\s*(.+?)\s*(a(?:nswer)?|back)\s*:\s*(.+)$/gim
      let match
      while ((match = singleLineRegex.exec(text)) !== null) {
        const front = cleanText(match[2])
        const back = cleanText(match[4])
        if (front && back) cards.push({ front, back, noteType })
      }
    }

    return cards
  },
}

// Strategy 2: Tab-separated (one pair per line)
const tabSeparatedStrategy: Strategy = {
  name: 'tab-separated',
  parse(text, noteType) {
    const cards: ParsedCard[] = []
    for (const line of text.split('\n')) {
      const parts = line.split('\t')
      if (parts.length >= 2) {
        const front = cleanText(parts[0])
        const back = cleanText(parts.slice(1).join('\t'))
        if (front && back) cards.push({ front, back, noteType })
      }
    }
    return cards
  },
}

// Strategy 3: Semicolon-separated
const semicolonStrategy: Strategy = {
  name: 'semicolon-separated',
  parse(text, noteType) {
    const cards: ParsedCard[] = []
    for (const line of text.split('\n')) {
      const parts = line.split(';')
      if (parts.length >= 2) {
        const front = cleanText(parts[0])
        const back = cleanText(parts.slice(1).join(';'))
        if (front && back) cards.push({ front, back, noteType })
      }
    }
    return cards
  },
}

// Strategy 4: Numbered pairs (1. question\n   answer)
const numberedPairStrategy: Strategy = {
  name: 'numbered-pairs',
  parse(text, noteType) {
    const cards: ParsedCard[] = []
    const numberedRegex = /^\d+[\.\)]\s+(.+)$/
    const lines = text.split('\n')
    let i = 0

    while (i < lines.length) {
      const match = numberedRegex.exec(lines[i])
      if (match) {
        const front = cleanText(match[1])
        const nextLines: string[] = []
        i++
        while (i < lines.length && !numberedRegex.test(lines[i]) && lines[i].trim()) {
          nextLines.push(lines[i].trim())
          i++
        }
        const back = cleanText(nextLines.join(' '))
        if (front && back) cards.push({ front, back, noteType })
      } else {
        i++
      }
    }

    return cards
  },
}

// Strategy 5: Alternating lines (odd = question, even = answer)
const alternatingLinesStrategy: Strategy = {
  name: 'alternating-lines',
  parse(text, noteType) {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2 || lines.length % 2 !== 0) return []

    const cards: ParsedCard[] = []
    for (let i = 0; i + 1 < lines.length; i += 2) {
      const front = cleanText(lines[i])
      const back = cleanText(lines[i + 1])
      if (front && back) cards.push({ front, back, noteType })
    }
    return cards
  },
}

// Strategy 6: Cloze detection — lines with {{c1::...}} syntax
const clozeStrategy: Strategy = {
  name: 'cloze-detection',
  parse(text, noteType) {
    if (noteType !== 'Cloze+' && noteType !== 'Cloze++') return []

    const cards: ParsedCard[] = []
    const clozeRegex = /\{\{c\d+::/

    for (const line of text.split('\n')) {
      const trimmed = cleanText(line)
      if (clozeRegex.test(trimmed)) {
        // Extra hint after || separator
        const parts = trimmed.split(' || ')
        const front = parts[0]
        const back = parts[1] || ''
        cards.push({ front, back, noteType })
      }
    }
    return cards
  },
}

const strategies: Strategy[] = [
  clozeStrategy,
  labeledPairStrategy,
  tabSeparatedStrategy,
  semicolonStrategy,
  numberedPairStrategy,
  alternatingLinesStrategy,
]

export function parseCards(text: string, noteType: NoteType): ParseResult {
  if (!text.trim()) {
    return { cards: [], confidence: 0, strategy: 'none' }
  }

  let bestResult: ParseResult = { cards: [], confidence: 0, strategy: 'none' }

  for (const strategy of strategies) {
    const cards = strategy.parse(text, noteType)
    const confidence = cards.length

    if (confidence > bestResult.confidence) {
      bestResult = { cards, confidence, strategy: strategy.name }
    }
  }

  return bestResult
}
