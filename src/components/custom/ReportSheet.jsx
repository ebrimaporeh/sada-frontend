import { useState } from 'react'
import { Edit2, Loader2, AlertCircle } from 'lucide-react'
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

const campaignStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
]

export function ReportSheet({
  isOpen,
  onClose,
  report,
  isEditMode,
  onEditMode,
  editData,
  onEditChange,
  onSave,
  isSaving,
  onCampaignStatusChange,
  isChangingCampaignStatus,
}) {
  if (!report) return null

  const campaign = report.campaign
  const reasonInfo = reasonLabels[report.reason]

  const [isChangingCampaignStatusMode, setIsChangingCampaignStatusMode] = useState(false)
  const [campaignStatusData, setCampaignStatusData] = useState({
    campaign_status: campaign?.status || '',
    campaign_status_reason: '',
  })

  const handleEditClick = () => onEditMode(true)
  const handleCancelClick = () => onEditMode(false)

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={report?.campaign?.title || 'Report Details'}
      header={
        !isEditMode && (
          <button
            onClick={handleEditClick}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Edit report"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )
      }
      footer={
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <button
                onClick={handleCancelClick}
                className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
            >
              Close
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {isEditMode ? (
          <>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">STATUS</label>
              <select
                value={editData.status || ''}
                onChange={(e) => onEditChange({ status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="pending">Pending Review</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">REASON</label>
              <select
                value={editData.reason || ''}
                onChange={(e) => onEditChange({ reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="fraudulent">Fraudulent Activity</option>
                <option value="misleading">Misleading Information</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="spam">Spam or Scam</option>
                <option value="duplicate">Duplicate Campaign</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">DESCRIPTION</label>
              <textarea
                value={editData.description || ''}
                onChange={(e) => onEditChange({ description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
                rows="3"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">ADMIN NOTES</label>
              <textarea
                value={editData.admin_notes || ''}
                onChange={(e) => onEditChange({ admin_notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
                rows="3"
                placeholder="Add internal notes about this report..."
              />
            </div>
          </>
        ) : (
          <>
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

            {/* Campaign Details Section */}
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
                    <p className="text-xs font-semibold text-blue-700 mb-1.5">Campaign Status</p>
                    <p className="text-blue-900 capitalize font-medium mb-2">{campaign.status}</p>
                    {!isChangingCampaignStatusMode && (
                      <button
                        onClick={() => {
                          setIsChangingCampaignStatusMode(true)
                          setCampaignStatusData({
                            campaign_status: campaign.status,
                            campaign_status_reason: '',
                          })
                        }}
                        className="w-full px-3 py-2 border border-blue-300 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Change Campaign Status
                      </button>
                    )}
                  </div>

                  {isChangingCampaignStatusMode && (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-1.5">New Campaign Status</p>
                        <select
                          value={campaignStatusData.campaign_status}
                          onChange={(e) => {
                            setCampaignStatusData({
                              ...campaignStatusData,
                              campaign_status: e.target.value,
                            })
                          }}
                          disabled={isChangingCampaignStatus}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                        >
                          {campaignStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-1.5">Reason for Status Change</p>
                        <textarea
                          value={campaignStatusData.campaign_status_reason}
                          onChange={(e) => {
                            setCampaignStatusData({
                              ...campaignStatusData,
                              campaign_status_reason: e.target.value,
                            })
                          }}
                          disabled={isChangingCampaignStatus}
                          placeholder="Provide a reason for this status change (e.g., 'Rejecting due to fraudulent content reported')"
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none disabled:opacity-50"
                          rows="2"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setIsChangingCampaignStatusMode(false)}
                          className="flex-1 px-3 py-2 border border-blue-300 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          disabled={isChangingCampaignStatus}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (onCampaignStatusChange) {
                              onCampaignStatusChange(
                                campaign.id,
                                campaignStatusData.campaign_status,
                                campaignStatusData.campaign_status_reason
                              )
                            }
                          }}
                          disabled={isChangingCampaignStatus}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {isChangingCampaignStatus ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Campaign Status'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {report.admin_notes && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <label className="text-xs font-semibold text-yellow-900 block mb-1">ADMIN NOTES</label>
                <p className="text-sm text-yellow-800 leading-relaxed">{report.admin_notes}</p>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  )
}
