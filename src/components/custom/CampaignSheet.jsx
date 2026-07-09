import { ExternalLink } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Sheet } from './Sheet'
import { formatGMD, formatDate, progressPercent } from '@/utils/formatters'

export function CampaignSheet({
  isOpen,
  onClose,
  campaign,
}) {
  const navigate = useNavigate()
  if (!campaign) return null

  const handleViewDetails = () => {
    onClose()
    navigate({ to: `/admin/campaigns/${campaign.id}` })
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={campaign?.title}
      footer={
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Details
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">GOAL</label>
          <p className="text-lg font-bold text-primary">{formatGMD(campaign.goal)}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">RAISED</label>
          <p className="text-sm">{formatGMD(campaign.raised)} ({progressPercent(campaign.raised, campaign.goal)}%)</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">STATUS</label>
          <p className="text-sm capitalize font-medium">{campaign.status}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">REGION</label>
          <p className="text-sm">{campaign.region || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">BENEFICIARY</label>
          <p className="text-sm">{campaign.beneficiary || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">CATEGORY</label>
          <p className="text-sm">{campaign.category_name || '—'}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">DEADLINE</label>
          <p className="text-sm">{formatDate(campaign.deadline)}</p>
        </div>
      </div>
    </Sheet>
  )
}
