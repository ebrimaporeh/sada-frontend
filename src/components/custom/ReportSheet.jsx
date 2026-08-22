import { AlertCircle } from 'lucide-react'
import { Sheet } from './Sheet'
import { formatDate, formatGMD } from '@/utils/formatters'

const reasonLabels = {
  fraudulent: { label: 'Fraudulent Activity', color: 'bg-red-100 text-red-700' },
  misleading: { label: 'Misleading Info', color: 'bg-orange-100 text-orange-700' },
  inappropriate: { label: 'Inappropriate', color: 'bg-pink-100 text-pink-700' },
  spam: { label: 'Spam/Scam', color: 'bg-yellow-100 text-yellow-700' },
  duplicate: { label: 'Duplicate', color: 'bg-blue-100 text-blue-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
}

export function ReportSheet({ isOpen, onClose, report }) {
  if (!report) return null

  const campaign = report.campaign
  const reasonInfo = reasonLabels[report.reason]

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={report?.campaign?.title || 'Report Details'}
      footer={
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">REASON</label>
          <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold mt-1 ${reasonInfo?.color || 'bg-gray-100 text-gray-700'}`}>
            {reasonInfo?.label || report.reason}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">STATUS</label>
          <p className="text-sm capitalize font-medium">{report.status}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">REPORTER</label>
          <p className="text-sm">{report.reported_by_name || 'Anonymous'}</p>
        </div>

        {report.reported_by_email && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">EMAIL</label>
            <p className="text-sm">{report.reported_by_email}</p>
          </div>
        )}

        {report.reporter_phone && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">PHONE</label>
            <p className="text-sm">{report.reporter_phone}</p>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">DESCRIPTION</label>
          <p className="text-sm leading-relaxed">{report.description}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">REPORTED ON</label>
          <p className="text-sm">{formatDate(report.created_at)}</p>
        </div>

        {/* Campaign Details Section — read-only. Suspend/status changes for
            a campaign live on the campaign's own detail page, not here. */}
        {campaign && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">Reported Campaign</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">Title</p>
                <p className="text-blue-900">{campaign.title}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">Owner</p>
                <p className="text-blue-900">{campaign.owner?.full_name || 'Unknown'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">Raised</p>
                  <p className="text-blue-900 font-semibold">{formatGMD(campaign.raised || 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">Goal</p>
                  <p className="text-blue-900 font-semibold">{formatGMD(campaign.goal || 0)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">Campaign Status</p>
                <p className="text-blue-900 capitalize font-medium">{campaign.status}</p>
              </div>
            </div>
          </div>
        )}

        {report.admin_notes && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <label className="text-xs font-semibold text-yellow-900 block mb-1">ADMIN NOTES</label>
            <p className="text-sm text-yellow-800 leading-relaxed">{report.admin_notes}</p>
          </div>
        )}
      </div>
    </Sheet>
  )
}
