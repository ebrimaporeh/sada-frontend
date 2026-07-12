import { ShieldCheck, X } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants'

export function VerifyPromptModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card border rounded-2xl p-6 max-w-sm w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="font-bold text-base">Verify your identity first?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Verified campaign owners get a blue verified badge donors can see — it builds trust and helps your campaign raise more.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={() => navigate({ to: ROUTES.VERIFICATION })}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <ShieldCheck className="w-4 h-4" /> Verify Now
          </button>
        </div>
      </div>
    </div>
  )
}
