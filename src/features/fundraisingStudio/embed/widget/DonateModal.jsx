import { DonationFlowPreview } from './DonationFlowPreview'

// Opened by FundraisingWidget's Donate button so a visitor can fill out and
// submit a donation without ever leaving the host site the widget is
// embedded on. Same hand-rolled overlay convention as
// src/components/custom/ConfirmModal.jsx (no portal, no focus trap) --
// nothing else in this codebase uses anything fancier. The themed content
// itself is DonationFlowPreview -- the same component Embed Studio's
// "Design Donation Flow" step renders inline for a live, always-visible
// preview, so the two can never drift apart.
export function DonateModal({ destination, embedId, theme, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DonationFlowPreview
          destination={destination}
          embedId={embedId}
          theme={theme}
          onClose={onClose}
          className="rounded-2xl"
        />
      </div>
    </div>
  )
}
