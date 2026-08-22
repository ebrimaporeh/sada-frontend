import {
  Target, TrendingUp, Landmark, Wallet, Users, Eye, Mail, Phone,
  AlertCircle, ImageOff,
} from 'lucide-react'
import { formatGMD, formatDate, progressPercent } from '@/utils/formatters'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { StatCard, SectionCard } from './shared'
import { CAMPAIGN_STATUS } from '@/constants'

export function OverviewTab({ campaign }) {
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

      {campaign.status === CAMPAIGN_STATUS.REJECTED && campaign.rejection_reason && (
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

      {/* Status change and suspension actions live in the page header, next
          to the status badge -- this is read-only context about the current
          suspension, if any. */}
      {campaign.status === CAMPAIGN_STATUS.SUSPENDED && (
        <SectionCard title="Suspension Details">
          <div className="space-y-3 text-sm">
            {campaign.rejection_reason && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">REASON</p>
                <p>{campaign.rejection_reason}</p>
              </div>
            )}
            {campaign.admin_notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">NOTES</p>
                <p className="text-muted-foreground">{campaign.admin_notes}</p>
              </div>
            )}
            {!campaign.rejection_reason && !campaign.admin_notes && (
              <p className="text-muted-foreground">No reason or notes were recorded for this suspension.</p>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
