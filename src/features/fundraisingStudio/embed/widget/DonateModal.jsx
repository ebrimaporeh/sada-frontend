import { DonateCheckout } from '@/features/donations/components/DonateCheckout'
import { OrganizationDonateCheckout } from '@/features/donations/components/OrganizationDonateCheckout'

// Opened by FundraisingWidget's Donate button so a visitor can fill out and
// submit a donation without ever leaving the host site the widget is
// embedded on. Same hand-rolled overlay convention as
// src/components/custom/ConfirmModal.jsx (no portal, no focus trap) --
// nothing else in this codebase uses anything fancier. Reuses the real
// checkout components in their `embedded` mode (see DonateCheckout.jsx/
// OrganizationDonateCheckout.jsx) rather than duplicating the donation form
// -- same state, same validation, same mutations as the standalone
// /donate/$slug and /give/$slug pages. The actual payment-gateway handoff
// still breaks out of this iframe entirely (window.top.location.href in
// both checkout components) -- that hop can't be avoided, see
// FundraisingWidget.jsx's own comment on why.
export function DonateModal({ destination, embedId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {destination.type === 'campaign' ? (
          <DonateCheckout campaign={destination} embedded embedId={embedId} onCancel={onClose} />
        ) : (
          <OrganizationDonateCheckout organization={destination} embedded embedId={embedId} onCancel={onClose} />
        )}
      </div>
    </div>
  )
}
