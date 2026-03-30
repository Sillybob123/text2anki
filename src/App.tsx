import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useParsedCards } from './hooks/useParsedCards'
import { useCardHashes } from './hooks/useCardHashes'
import { useToast, Toast } from './components/shared/Toast'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Button } from './components/shared/Button'
import { NoteTypeSelector } from './components/input/NoteTypeSelector'
import { DeckNameField } from './components/input/DeckNameField'
import { FormatHints } from './components/input/FormatHints'
import { CardPreviewItem } from './components/preview/CardPreviewItem'
import { AiPromptModal } from './components/modals/AiPromptModal'
import { generateApkg } from './lib/apkgGenerator'
import type { NoteType, ParsedCard } from './types'

export default function App() {
  const { user, loading } = useAuth()
  const { toasts, addToast, removeToast } = useToast()

  const [text, setText] = useState('')
  const [deckName, setDeckName] = useState('My Study Deck')
  const [noteType, setNoteType] = useState<NoteType>('Basic')
  const [previewCards, setPreviewCards] = useState<ParsedCard[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [dupCount, setDupCount] = useState(0)

  const { cards: liveCards, strategy } = useParsedCards(text, noteType)
  const { filterAndSave } = useCardHashes(user)

  const handleConvert = useCallback(() => {
    if (liveCards.length === 0) {
      addToast('No cards detected. Try a supported format.', 'error')
      return
    }
    setPreviewCards(liveCards)
    setDupCount(0)
    setShowPreview(true)
  }, [liveCards, addToast])

  const handleDownload = useCallback(async () => {
    if (previewCards.length === 0) return
    setGenerating(true)
    try {
      const deckId = deckName.toLowerCase().replace(/\s+/g, '-')
      const { newCards, dupCount: dupes } = await filterAndSave(previewCards, deckId)
      setDupCount(dupes)

      if (newCards.length === 0) {
        addToast('All cards are duplicates — nothing new to download!', 'info')
        setGenerating(false)
        return
      }

      const blob = await generateApkg(newCards, deckName)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${deckName.replace(/[^a-z0-9]/gi, '_')}.apkg`
      a.click()
      URL.revokeObjectURL(url)

      addToast(`Downloaded ${newCards.length} card${newCards.length !== 1 ? 's' : ''}${dupes > 0 ? ` (${dupes} dupes skipped)` : ''}!`, 'success')
    } catch (err) {
      console.error(err)
      addToast('Failed to generate .apkg. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }, [previewCards, deckName, filterAndSave, addToast])

  const handleClear = () => {
    setText('')
    setPreviewCards([])
    setShowPreview(false)
    setDupCount(0)
  }

  // Keyboard shortcut: Ctrl/Cmd+Enter to convert
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleConvert()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleConvert])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-sage border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Sign-in prompt if not signed in */}
        {!user && (
          <div className="bg-lavender-muted/40 border border-lavender/30 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl">✨</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Sign in to unlock deduplication</p>
              <p className="text-sm text-text-secondary mt-0.5">
                Track which cards you've already downloaded — never get duplicate cards in your decks.
                Works without sign-in too!
              </p>
            </div>
          </div>
        )}

        {/* Main input card */}
        <div className="bg-white/50 backdrop-blur-calm rounded-3xl border border-lavender/30 shadow-calm p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <DeckNameField value={deckName} onChange={setDeckName} />
            <NoteTypeSelector value={noteType} onChange={setNoteType} />
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Paste your Q&A text
              </label>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                liveCards.length > 0
                  ? 'bg-teal-calm/10 text-teal-calm'
                  : 'text-text-muted'
              }`}>
                {liveCards.length > 0 ? `${liveCards.length} card${liveCards.length !== 1 ? 's' : ''} detected` : 'Paste text to begin'}
              </span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={noteType === 'Basic'
                ? `Q: What is photosynthesis?\nA: The process by which plants convert light into energy\n\nQ: What organelle performs photosynthesis?\nA: The chloroplast`
                : `The {{c1::mitochondria}} is the powerhouse of the cell || Biology\n{{c1::Photosynthesis}} converts light energy into {{c2::chemical energy}} ||`
              }
              rows={10}
              className="
                w-full rounded-2xl px-4 py-3 text-sm
                bg-white/60 border border-lavender/40
                text-text-primary placeholder:text-text-muted/70
                focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20
                transition-all resize-y font-mono leading-relaxed
              "
            />
            <FormatHints noteType={noteType} strategy={strategy} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              variant="primary"
              onClick={handleConvert}
              disabled={!text.trim()}
              title="Ctrl+Enter"
            >
              Preview Cards
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAiModalOpen(true)}
            >
              ✨ AI Format Prompt
            </Button>
            {text && (
              <Button variant="ghost" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Preview section */}
        {showPreview && previewCards.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-text-primary">
                  {previewCards.length} card{previewCards.length !== 1 ? 's' : ''}
                </h2>
                {dupCount > 0 && (
                  <span className="text-xs bg-warm-sand text-warm-rose px-3 py-1 rounded-full font-medium">
                    {dupCount} dupe{dupCount !== 1 ? 's' : ''} will be skipped
                  </span>
                )}
              </div>
              <Button
                variant="download"
                onClick={handleDownload}
                loading={generating}
                disabled={generating}
              >
                Download .apkg
              </Button>
            </div>

            {/* Card list */}
            <div className="space-y-3">
              {previewCards.map((card, i) => (
                <CardPreviewItem
                  key={i}
                  card={card}
                  index={i}
                />
              ))}
            </div>

            {/* Bottom download button for long lists */}
            {previewCards.length > 5 && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="download"
                  onClick={handleDownload}
                  loading={generating}
                  disabled={generating}
                >
                  Download .apkg
                </Button>
              </div>
            )}
          </div>
        )}

        {/* How to import guide */}
        <div className="bg-lavender-muted/30 border border-lavender/20 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-text-primary text-sm">How to import into Anki</h3>
          <ol className="space-y-1.5 text-sm text-text-secondary">
            <li className="flex gap-2"><span className="text-sage font-bold shrink-0">1.</span> Download the .apkg file above</li>
            <li className="flex gap-2"><span className="text-sage font-bold shrink-0">2.</span> Open Anki on your desktop</li>
            <li className="flex gap-2"><span className="text-sage font-bold shrink-0">3.</span> Go to <strong>File → Import</strong> (or double-click the .apkg file)</li>
            <li className="flex gap-2"><span className="text-sage font-bold shrink-0">4.</span> Your deck appears in the deck list, ready to study</li>
          </ol>
        </div>
      </main>

      <Footer />
      <Toast toasts={toasts} removeToast={removeToast} />
      <AiPromptModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} noteType={noteType} />
    </div>
  )
}
