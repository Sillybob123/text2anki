import type { ParsedCard } from '../../types'

interface Props {
  card: ParsedCard
  index: number
  isDuplicate?: boolean
}

export function CardPreviewItem({ card, index, isDuplicate }: Props) {
  return (
    <div
      className={`
        group rounded-2xl border transition-all animate-fade-in
        ${isDuplicate
          ? 'bg-warm-sand/30 border-warm-sand opacity-60'
          : 'bg-white/60 border-lavender/30 hover:shadow-card hover:border-lavender/60'
        }
      `}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="p-4 flex gap-4 items-start">
        <span className="text-xs font-bold text-text-muted mt-0.5 w-6 shrink-0 text-right">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0 grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              {card.noteType === 'Basic' ? 'Front' : 'Text'}
            </span>
            <p className="text-sm text-text-primary leading-relaxed break-words">{card.front}</p>
          </div>
          {card.back && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                {card.noteType === 'Basic' ? 'Back' : 'Extra'}
              </span>
              <p className="text-sm text-text-secondary leading-relaxed break-words">{card.back}</p>
            </div>
          )}
        </div>
        {isDuplicate && (
          <span className="text-xs bg-warm-sand text-warm-rose px-2 py-0.5 rounded-full shrink-0 font-medium">
            dupe
          </span>
        )}
      </div>
    </div>
  )
}
