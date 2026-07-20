import { useState } from 'react'
import {
  Target, TrendingUp, Landmark, Wallet, Users, Eye, Mail, Phone,
  Loader2, AlertCircle, ImageOff,
} from 'lucide-react'
import { useAdminChangeCampaignStatus } from '@/hooks/useCampaigns'
import { formatGMD, formatDate, progressPercent } from '@/utils/formatters'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { useMe } from '@/hooks/useAuth'
import { Resource, hasResourceAccess } from '@/utils/permissions'
import { StatCard, SectionCard } from './shared'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
]

export function OverviewTab({ campaign, onRefetch }) {
  const { data: me } = useMe()
  const canModerate = hasResourceAccess(me?.role, Resource.CAMPAIGNS_MODERATE)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')
  const statusMutation = useAdminChangeCampaignStatus()

  const handleStatusChange = () => {
    if (!newStatus) return
    statusMutation.mutate(
      { id: campaign.id, status: newStatus, reason },
      {
        onSuccess: () => {
          setIsEditingStatus(false)
          setNewStatus('')
          setReason('')
          onRefetch?.()
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      {/* Cover image */}
      {campaign.cover_image_url ? (
        <img
          src={campaign.cover_image_url}
          alt={campaign.title}
          className="w-full max-h-80 object-cover rounded-2xl border"
        />
      ) : (
        <div className="w-full h-32 rounded-2xl border bg-muted flex items-center justify-center text-muted-foreground gap-2 text-sm">
          <ImageOff className="w-4 h-4" /> No cover image
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Goal" value={formatGMD(campaign.goal)} icon={Target} color="bg-primary/10 text-primary" />
        <StatCard label="Raised" value={formatGMD(campaign.raised)} sub={`${progressPercent(campaign.raised, campaign.goal)}% funded`} icon={TrendingUp} color="bg-green-100 text-green-700" />
        <StatCard label="Withdrawn" value={formatGMD(campaign.total_withdrawn)} icon={Landmark} color="bg-blue-100 text-blue-700" />
        <StatCard label="Available" value={formatGMD(campaign.available_balance)} icon={Wallet} color="bg-amber-100 text-amber-700" />
        <StatCard label="Donors" value={campaign.donors_count} icon={Users} color="bg-purple-100 text-purple-700" />
        <StatCard label="Views" value={campaign.views_count ?? 0} icon={Eye} color="bg-gray-100 text-gray-600" />
      </div>

      <div>
        <ProgressBar value={campaign.raised} max={campaign.goal} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <SectionCard title="Details">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-semibold capitalize">{campaign.status}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{campaign.category_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-medium capitalize">{campaign.region}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="font-medium">{formatDate(campaign.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Deadline</span><span className="font-medium">{campaign.deadline ? formatDate(campaign.deadline) : '—'}</span></div>
            {campaign.approved_at && (
              <div className="flex justify-between"><span className="text-muted-foreground">Approved</span><span className="font-medium">{formatDate(campaign.approved_at)}</span></div>
            )}
            {campaign.completed_at && (
              <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-medium">{formatDate(campaign.completed_at)}</span></div>
            )}
          </div>
        </SectionCard>

        {/* Owner */}
        <SectionCard title="Campaign Owner">
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-base">{campaign.owner_name}</p>
            <p className="inline-flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {campaign.owner_email}</p>
            {campaign.owner_phone && (
              <p className="inline-flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {campaign.owner_phone}</p>
            )}
            <p className="text-xs text-muted-foreground">Joined {formatDate(campaign.owner_joined_at)}</p>
            {campaign.is_anonymous && (
              <p className="text-xs text-muted-foreground border-t pt-2 mt-2">Owner identity is hidden from the public campaign page.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Short Description">
        <p className="text-sm leading-relaxed">{campaign.short_description}</p>
      </SectionCard>

      <SectionCard title="Story">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{campaign.story}</p>
      </SectionCard>

      {campaign.images?.length > 0 && (
        <SectionCard title={`Gallery (${campaign.images.length})`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {campaign.images.map((img) => (
              <img key={img.id} src={img.image_url} alt="" className="w-full h-24 object-cover rounded-lg border" />
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title={`Updates (${campaign.updates_count ?? campaign.updates?.length ?? 0})`}>
        {campaign.updates?.length > 0 ? (
          <div className="space-y-4">
            {campaign.updates.map((update) => (
              <div key={update.id} className="border-l-2 border-primary/30 pl-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{update.title}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(update.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{update.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No updates posted yet.</p>
        )}
      </SectionCard>

      {/* Status change */}
      {canModerate && (
        <SectionCard title="Campaign Status">
          {!isEditingStatus ? (
            <button
              onClick={() => { setNewStatus(campaign.status); setIsEditingStatus(true) }}
              className="w-full px-4 py-3 rounded-xl border hover:bg-accent transition-colors text-sm font-medium"
            >
              Change Campaign Status
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">NEW STATUS</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring bg-background"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {(newStatus === 'rejected' || newStatus === 'suspended') && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">
                    REASON FOR {newStatus === 'rejected' ? 'REJECTION' : 'SUSPENSION (OPTIONAL)'}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Provide a reason for ${newStatus === 'rejected' ? 'rejecting' : 'suspending'} this campaign...`}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring bg-background resize-none"
                    rows="3"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditingStatus(false); setReason('') }}
                  className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={statusMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {campaign.rejection_reason && (
        <div className="p-4 border border-red-200 rounded-2xl bg-red-50 text-red-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Rejection Reason</p>
              <p className="text-sm mt-1">{campaign.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
