import { useState } from 'react'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { useTransferOwnership } from '@/hooks/useOrganizations'

// Only ever opened by the current Owner (see MembersTab) -- picking a
// target from the org's other members, then a final confirm step since
// this immediately gives up the acting user's own Owner role (they fall
// back to the org's Member role, see organization_service.transfer_ownership).
export function TransferOwnershipModal({ isOpen, onClose, organizationId, candidates, organizationName }) {
  const [targetUserId, setTargetUserId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const transferOwnership = useTransferOwnership(organizationId)

  function handleClose() {
    setTargetUserId('')
    setConfirming(false)
    transferOwnership.reset()
    onClose()
  }

  const target = candidates.find((c) => c.user_id === targetUserId)

  if (confirming) {
    return (
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setConfirming(false)}
        onConfirm={() => transferOwnership.mutate(targetUserId, { onSuccess: handleClose })}
        title={`Transfer ownership to ${target?.user_name}?`}
        description={`You'll become a regular Member of ${organizationName}, and ${target?.user_name} will get full Owner permissions, including the ability to remove you. This can be undone later, but only by whoever holds the Owner role at that time.`}
        confirmLabel="Yes, transfer ownership"
        isLoading={transferOwnership.isPending}
        variant="destructive"
        errorMessage={transferOwnership.isError ? transferOwnership.error?.response?.data?.message || 'Failed to transfer ownership.' : null}
      />
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-card border rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="font-bold text-base">Transfer Ownership</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose which member becomes the new Owner.</p>
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            There's no other member to transfer ownership to yet. Invite someone first.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {candidates.map((c) => (
              <button
                key={c.user_id}
                type="button"
                onClick={() => setTargetUserId(c.user_id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${targetUserId === c.user_id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              >
                <p className="text-sm font-semibold">{c.user_name}</p>
                <p className="text-xs text-muted-foreground">{c.user_email} · currently {c.role_name}</p>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={handleClose} className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={() => setConfirming(true)}
            disabled={!targetUserId}
            className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
