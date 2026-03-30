import type { NoteType } from '../../types'

interface Props {
  value: NoteType
  onChange: (type: NoteType) => void
}

const types: NoteType[] = ['Basic', 'Cloze+', 'Cloze++']

const descriptions: Record<NoteType, string> = {
  'Basic': 'Simple front/back flashcards',
  'Cloze+': 'Fill-in-the-blank cards',
  'Cloze++': 'Enhanced cloze with rich context',
}

export function NoteTypeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
        Card Type
      </label>
      <div className="flex gap-2 flex-wrap">
        {types.map(type => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`
              flex-1 min-w-[100px] rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-center
              ${value === type
                ? 'bg-sage text-white shadow-calm'
                : 'bg-lavender-muted/50 text-text-secondary hover:bg-lavender-muted border border-lavender/30'
              }
            `}
          >
            <div className="font-semibold">{type}</div>
            <div className={`text-xs mt-0.5 ${value === type ? 'text-white/80' : 'text-text-muted'}`}>
              {descriptions[type]}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
