import { useState } from 'react'
import { Ban, Loader2, RefreshCw, X } from 'lucide-react'
import { useAdminChangeCampaignStatus, useAdminCampaignAction } from '@/hooks/useCampaigns'
import { Select } from '@/components/custom/Select'
import { ConfirmModal } from '@/components/custom/ConfirmModal'
import { CAMPAIGN_STATUS } from '@/constants'

// 'suspended' is deliberately not one of these -- suspending has its own
// dedicated modal below that captures a reason *and* notes and sends a
// dedicated suspension email, instead of the generic status-update email
// this flow triggers.
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
]

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border rounded-2xl max-w-md w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function ChangeStatusModal({ campaign, onClose, onRefetch }) {
  const [newStatus, setNewStatus] = useState(campaign.status)
  const [reason, setReason] = useState('')
  const statusMutation = useAdminChangeCampaignStatus()

  function handleSubmit() {
    if (!newStatus) return
    statusMutation.mutate(
      { id: campaign.id, status: newStatus, reason },
      { onSuccess: () => { onRefetch?.(); onClose() } },
    )
  }

  return (
    <ModalShell title="Change Campaign Status" onClose={onClose}>
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-2">NEW STATUS</label>
        <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} options={STATUS_OPTIONS} />
      </div>

      {newStatus === 'rejected' && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">REASON FOR REJECTION</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a reason for rejecting this campaign..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring bg-background resize-none"
            rows="3"
          />
        </div>
      )}

      {statusMutation.isError && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-2.5">
          {statusMutation.error?.response?.data?.message || 'Failed to update status.'}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onClose}
          disabled={statusMutation.isPending}
          className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={statusMutation.isPending || newStatus === campaign.status}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {statusMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {statusMutation.isPending ? 'Updating…' : 'Update Status'}
        </button>
      </div>
    </ModalShell>
  )
}

function SuspendModal({ campaign, onClose, onRefetch }) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const suspendMutation = useAdminCampaignAction()

  function handleConfirm() {
    suspendMutation.mutate(
      { id: campaign.id, action: 'suspend', reason, notes },
      { onSuccess: () => { onRefetch?.(); setIsConfirmOpen(false); onClose() } },
    )
  }

  return (
    <ModalShell title="Suspend Campaign" onClose={onClose}>
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-2">REASON</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Shown to the campaign owner, e.g. 'Fraudulent activity reported'..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring bg-background resize-none"
          rows="2"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-2">NOTES (INTERNAL)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Staff-only context about this decision -- not shown to the owner..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring bg-background resize-none"
          rows="2"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={!reason.trim()}
          className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50"
        >
          Suspend Campaign
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={`Suspend "${campaign.title}"?`}
        description="The campaign is immediately taken offline and the owner is emailed the reason above. This can be reversed later via Change Status."
        confirmLabel="Suspend"
        isLoading={suspendMutation.isPending}
        errorMessage={suspendMutation.isError ? suspendMutation.error?.response?.data?.message || 'Failed to suspend campaign.' : null}
      />
    </ModalShell>
  )
}

export function StatusActions({ campaign, onRefetch }) {
  const [openModal, setOpenModal] = useState(null) // null | 'status' | 'suspend'
  const isSuspended = campaign.status === CAMPAIGN_STATUS.SUSPENDED

  return (
    <>
      <button
        onClick={() => setOpenModal('status')}
        className="inline-flex items-center gap-1.5 text-xs border font-medium px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Change Status
      </button>

      {!isSuspended && (
        <button
          onClick={() => setOpenModal('suspend')}
          className="inline-flex items-center gap-1.5 text-xs border border-red-200 text-red-700 font-medium px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
        >
          <Ban className="w-3.5 h-3.5" /> Suspend
        </button>
      )}

      {openModal === 'status' && (
        <ChangeStatusModal campaign={campaign} onClose={() => setOpenModal(null)} onRefetch={onRefetch} />
      )}
      {openModal === 'suspend' && (
        <SuspendModal campaign={campaign} onClose={() => setOpenModal(null)} onRefetch={onRefetch} />
      )}
    </>
  )
}
