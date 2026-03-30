import type { NoteType } from '../../types'

interface Props {
  noteType: NoteType
  strategy: string
}

const basicFormats = [
  { label: 'Q:/A:', example: 'Q: What is X?\nA: The answer' },
  { label: 'Tab', example: 'Question\tAnswer' },
  { label: 'Semicolon', example: 'Question; Answer' },
  { label: 'Numbered', example: '1. Question\n   Answer' },
  { label: 'Alternating', example: 'Question\nAnswer\nQuestion\nAnswer' },
]

const clozeFormats = [
  { label: 'Cloze', example: 'The {{c1::answer}} is here || hint' },
  { label: 'Multi-cloze', example: '{{c1::A}} and {{c2::B}} || extra' },
]

const strategyLabels: Record<string, string> = {
  'labeled-pairs': 'Q:/A: format',
  'tab-separated': 'tab-separated',
  'semicolon-separated': 'semicolon-separated',
  'numbered-pairs': 'numbered pairs',
  'alternating-lines': 'alternating lines',
  'cloze-detection': 'cloze syntax',
  'none': '',
}

export function FormatHints({ noteType, strategy }: Props) {
  const formats = noteType === 'Basic' ? basicFormats : clozeFormats

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">Supported formats:</span>
        {strategy && strategy !== 'none' && (
          <span className="text-xs bg-sage/10 text-sage px-2 py-0.5 rounded-full font-medium">
            Auto-detected: {strategyLabels[strategy]}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {formats.map(f => (
          <div
            key={f.label}
            title={f.example}
            className="text-xs bg-lavender-muted/40 text-text-secondary px-2.5 py-1 rounded-lg border border-lavender/20 cursor-default hover:bg-lavender-muted/70 transition-colors"
          >
            {f.label}
          </div>
        ))}
      </div>
    </div>
  )
}
