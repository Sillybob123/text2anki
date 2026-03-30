import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  text: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  removeToast: (id: string) => void
}

export function Toast({ toasts, removeToast }: ToastProps) {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const colors = {
    success: 'bg-sage text-white',
    error: 'bg-warm-rose text-white',
    info: 'bg-teal-calm text-white',
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-calm-lg
        animate-slide-up cursor-pointer min-w-[240px]
        ${colors[toast.type]}
      `}
      onClick={onDismiss}
    >
      <span className="text-sm font-medium">{toast.text}</span>
    </div>
  )
}

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (text: string, type: ToastType = 'info') => {
    const id = String(++toastCounter)
    setToasts(prev => [...prev, { id, text, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
