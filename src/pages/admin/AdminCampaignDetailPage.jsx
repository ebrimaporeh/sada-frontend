import { useState } from 'react'
import { Link, useNavigate, useParams, useRouterState } from '@tanstack/react-router'
import {
  ArrowLeft, Loader2, AlertCircle, Eye, Mail, Phone, Flag,
  Sparkles, Flame, EyeOff, Wallet, Landmark, ImageOff,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAdminCampaigns, useAdminChangeCampaignStatus } from '@/hooks/useCampaigns'
import { campaignApi } from '@/api/campaignApi'
import { queryKeys } from '@/api/queryKeys'
import { formatGMD, formatDate, progressPercent } from '@/utils/formatters'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { cn } from '@/utils/cn'
import { useMe } from '@/hooks/useAuth'
import { Resource, hasResourceAccess } from '@/utils/permissions'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
]

export function AdminCampaignDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const state = useRouterState()
  const id = state.location.pathname.split('/').pop()
  const { data: me } = useMe()
  const canModerate = hasResourceAccess(me?.role, Resource.CAMPAIGNS_MODERATE)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')

  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: queryKeys.campaigns.adminDetail(id),
    queryFn: () => campaignApi.getAdminCampaignDetail(id).then((res) => res?.data?.campaign ?? null),
    enabled: Boolean(id),
  })

  const statusMutation = useAdminChangeCampaignStatus()

  const handleStatusChange = async () => {
    if (!newStatus) return

    statusMutation.mutate(
      { id, status: newStatus, reason },
      {
        onSuccess: () => {
          setIsEditingStatus(false)
          setNewStatus('')
          setReason('')
          refetch()
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Campaign not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/admin/campaigns' })}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              {campaign.is_urgent && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                  <Flame className="w-3 h-3" /> Urgent
                </span>
              )}
              {campaign.is_featured && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
              {campaign.is_anonymous && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  <EyeOff className="w-3 h-3" /> Anonymous owner
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{campaign.beneficiary}</p>
          </div>
        </div>
        <Link
          to="/campaigns/$slug"
          params={{ slug: campaign.slug }}
          className="inline-flex items-center gap-1.5 text-xs border font-medium px-3 py-1.5 rounded-full hover:bg-accent transition-colors flex-shrink-0"
        >
          <Eye className="w-3.5 h-3.5" /> Public view
        </Link>
      </div>

      {/* Cover image */}
      {campaign.cover_image_url ? (
        <img
          src={campaign.cover_image_url}
          alt={campaign.title}
          className="w-full max-h-80 object-cover rounded-lg border"
        />
      ) : (
        <div className="w-full h-32 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground gap-2 text-sm">
          <ImageOff className="w-4 h-4" /> No cover image
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Stats */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-xs font-semibold text-muted-foreground mb-2">GOAL</p>
            <p className="text-2xl font-bold text-primary">{formatGMD(campaign.goal)}</p>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <p className="text-xs font-semibold text-muted-foreground mb-2">RAISED</p>
            <p className="text-2xl font-bold">{formatGMD(campaign.raised)}</p>
            <ProgressBar value={campaign.raised} max={campaign.goal} />
            <p className="text-xs text-muted-foreground mt-2">{progressPercent(campaign.raised, campaign.goal)}% funded</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold text-muted-foreground mb-2">WITHDRAWN</p>
              <p className="text-lg font-bold flex items-center gap-1.5"><Landmark className="w-4 h-4 text-muted-foreground" /> {formatGMD(campaign.total_withdrawn)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold text-muted-foreground mb-2">AVAILABLE</p>
              <p className="text-lg font-bold flex items-center gap-1.5"><Wallet className="w-4 h-4 text-muted-foreground" /> {formatGMD(campaign.available_balance)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold text-muted-foreground mb-2">DONORS</p>
              <p className="text-xl font-bold">{campaign.donors_count}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold text-muted-foreground mb-2">VIEWS</p>
              <p className="text-xl font-bold">{campaign.views_count ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-xs font-semibold text-muted-foreground mb-2">STATUS</p>
            <p className="text-lg font-bold capitalize">{campaign.status}</p>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <p className="text-xs font-semibold text-muted-foreground mb-2">CATEGORY</p>
            <p className="text-sm">{campaign.category_name}</p>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <p className="text-xs font-semibold text-muted-foreground mb-2">REGION</p>
            <p className="text-sm capitalize">{campaign.region}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold text-muted-foreground mb-2">CREATED</p>
              <p className="text-sm">{formatDate(campaign.created_at)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold text-muted-foreground mb-2">DEADLINE</p>
              <p className="text-sm">{campaign.deadline ? formatDate(campaign.deadline) : '—'}</p>
            </div>
          </div>

          {(campaign.approved_at || campaign.completed_at) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-card">
                <p className="text-xs font-semibold text-muted-foreground mb-2">APPROVED</p>
                <p className="text-sm">{campaign.approved_at ? formatDate(campaign.approved_at) : '—'}</p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <p className="text-xs font-semibold text-muted-foreground mb-2">COMPLETED</p>
                <p className="text-sm">{campaign.completed_at ? formatDate(campaign.completed_at) : '—'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Owner */}
      <div className="p-4 border rounded-lg bg-card space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">CAMPAIGN OWNER</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="font-semibold">{campaign.owner_name}</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Mail className="w-3.5 h-3.5" /> {campaign.owner_email}
          </span>
          {campaign.owner_phone && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" /> {campaign.owner_phone}
            </span>
          )}
          <span className="text-xs text-muted-foreground">Joined {formatDate(campaign.owner_joined_at)}</span>
        </div>
        {campaign.is_anonymous && (
          <p className="text-xs text-muted-foreground">Owner identity is hidden from the public campaign page.</p>
        )}
      </div>

      {/* Description */}
      <div className="p-4 border rounded-lg bg-card space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">SHORT DESCRIPTION</p>
        <p className="text-sm leading-relaxed">{campaign.short_description}</p>
      </div>

      <div className="p-4 border rounded-lg bg-card space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">STORY</p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{campaign.story}</p>
      </div>

      {/* Gallery */}
      {campaign.images?.length > 0 && (
        <div className="p-4 border rounded-lg bg-card space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">GALLERY ({campaign.images.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {campaign.images.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt=""
                className="w-full h-24 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Updates */}
      <div className="p-4 border rounded-lg bg-card space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">UPDATES ({campaign.updates_count ?? campaign.updates?.length ?? 0})</p>
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
      </div>

      {/* Reports */}
      {campaign.reports_count > 0 && (
        <div className={cn(
          'p-4 border rounded-lg space-y-2',
          campaign.pending_reports_count > 0 ? 'border-red-200 bg-red-50' : 'bg-card',
        )}>
          <p className={cn(
            'text-xs font-semibold flex items-center gap-1.5',
            campaign.pending_reports_count > 0 ? 'text-red-700' : 'text-muted-foreground',
          )}>
            <Flag className="w-3.5 h-3.5" /> REPORTS
          </p>
          <p className="text-sm">
            {campaign.reports_count} total
            {campaign.pending_reports_count > 0 && `, ${campaign.pending_reports_count} pending review`}
          </p>
        </div>
      )}

      {/* Status Change Section */}
      {canModerate && (!isEditingStatus ? (
        <button
          onClick={() => {
            setNewStatus(campaign.status)
            setIsEditingStatus(true)
          }}
          className="w-full px-4 py-3 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
        >
          Change Campaign Status
        </button>
      ) : (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <h3 className="font-semibold">Change Campaign Status</h3>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">NEW STATUS</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring bg-background"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

          {newStatus === 'suspended' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">REASON FOR SUSPENSION (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for suspending this campaign..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring bg-background resize-none"
                rows="3"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditingStatus(false)
                setReason('')
              }}
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
      ))}

      {campaign.rejection_reason && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-800">
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
