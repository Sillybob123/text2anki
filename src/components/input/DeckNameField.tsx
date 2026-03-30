interface Props {
  value: string
  onChange: (v: string) => void
}

export function DeckNameField({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
        Deck Name
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="My Study Deck"
        className="
          w-full rounded-xl px-4 py-2.5 text-sm
          bg-white/60 border border-lavender/40
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20
          transition-all
        "
      />
    </div>
  )
}
