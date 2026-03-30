import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'download'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-sage text-white hover:bg-sage-dark shadow-calm hover:shadow-calm-lg transition-all',
  secondary:
    'bg-lavender-muted text-text-primary hover:bg-lavender-light border border-lavender transition-all',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-warm-sand/50 transition-all',
  download:
    'bg-teal-calm text-white hover:bg-teal-dark shadow-calm hover:shadow-calm-lg transition-all',
}

export function Button({
  variant = 'primary',
  children,
  loading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5
        font-semibold text-sm select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
