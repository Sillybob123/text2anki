import { useState } from 'react'
import { Modal } from './Modal'
import type { NoteType } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  noteType: NoteType
}

function buildPrompt(noteType: NoteType): string {
  if (noteType === 'Basic') {
    return `Please reformat my study notes into a Q&A format that I can paste directly into Text2Anki.

Use this exact format for each card (one blank line between cards):

Q: [The question here]
A: [The answer here]

Rules:
- Each Q: and A: must be on its own line
- Keep answers concise but complete
- Do not add extra commentary or numbering
- Separate each card with exactly one blank line

Here are my raw notes to reformat:
[PASTE YOUR NOTES HERE]`
  }

  if (noteType === 'Cloze+') {
    return `Please reformat my study notes into Anki Cloze+ format that I can paste directly into Text2Anki.

Use this exact format for each card (one card per line):

[Sentence with {{c1::hidden word or phrase}} in it] || [Optional hint or extra context]

Rules:
- Use {{c1::...}} for the primary cloze deletion
- Use {{c2::...}}, {{c3::...}} for additional deletions in the same sentence
- After || add an optional extra hint or empty string
- Keep one card per line
- The cloze text should be a complete, meaningful sentence

Example:
The {{c1::mitochondria}} is the {{c2::powerhouse}} of the cell || Biology basics
{{c1::Photosynthesis}} converts light energy into {{c2::chemical energy}} ||

Here are my raw notes to reformat:
[PASTE YOUR NOTES HERE]`
  }

  return `Please reformat my study notes into Anki Cloze++ format (extended cloze with rich extra context) for Text2Anki.

Use this exact format for each card (one card per line):

[Sentence with {{c1::hidden content::optional hint}} in it] || [Detailed extra context, mnemonics, or explanation]

Rules:
- Use {{c1::answer::hint}} where the hint is a short clue shown during recall
- After || include richer context: full explanation, memory aids, related concepts
- Keep one card per line
- Aim for deeper context in the Extra field than you would for Cloze+

Example:
The {{c1::krebs cycle::also called TCA}} produces {{c2::3 NADH}} per turn || Part of aerobic respiration; occurs in mitochondrial matrix; also yields 1 FADH₂ and 1 GTP per turn

Here are my raw notes to reformat:
[PASTE YOUR NOTES HERE]`
}

export function AiPromptModal({ open, onClose, noteType }: Props) {
  const [copied, setCopied] = useState(false)
  const prompt = buildPrompt(noteType)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="AI Formatting Prompt">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Copy this prompt and paste it into ChatGPT, Claude, or any LLM along with your raw notes.
          It will reformat them perfectly for <strong className="text-text-primary">{noteType}</strong> cards.
        </p>
        <pre className="bg-lavender-muted/50 rounded-xl p-4 text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto border border-lavender/30">
          {prompt}
        </pre>
        <button
          onClick={handleCopy}
          className={`
            w-full rounded-xl py-3 font-semibold text-sm transition-all
            ${copied
              ? 'bg-sage text-white'
              : 'bg-teal-calm text-white hover:bg-teal-dark'
            }
          `}
        >
          {copied ? '✓ Copied!' : 'Copy prompt'}
        </button>
      </div>
    </Modal>
  )
}
