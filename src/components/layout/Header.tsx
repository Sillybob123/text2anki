import type { User } from 'firebase/auth'
import { SignInButton } from '../auth/SignInButton'

interface Props {
  user: User | null
}

export function Header({ user }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-lavender/30 bg-cream/80 backdrop-blur-calm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage to-teal-calm flex items-center justify-center text-white text-sm font-bold shadow-card">
            T
          </div>
          <span className="font-bold text-text-primary text-lg">
            Text<span className="text-sage">2</span>Anki
          </span>
        </div>
        <SignInButton user={user} />
      </div>
    </header>
  )
}
