import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MapPin, Users, Clock, Flag, Heart, ChevronLeft, Lock, AlertCircle, X } from 'lucide-react'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { VerifiedTick } from '@/components/custom/VerifiedTick'
import { MarkdownContent } from '@/components/custom/MarkdownEditor'
import { formatGMD, formatDate, progressPercent, daysLeft, timeAgo } from '@/utils/formatters'
import { useCampaignDonors } from '@/hooks/useDonations'
import { useReportCampaign } from '@/hooks/useCampaigns'
import { useMe } from '@/hooks/useAuth'
import { ROUTES, CAMPAIGN_STATUS } from '@/constants'
import { cn } from '@/utils/cn'

function DonateButton({ slug, status, className }) {
  if (status !== CAMPAIGN_STATUS.ACTIVE) {
    return (
      <div className={cn('flex items-center justify-center gap-2 bg-muted text-muted-foreground font-medium text-sm px-6 py-3 rounded-xl w-full border', className)}>
        <Lock className="w-4 h-4" />
        {status === CAMPAIGN_STATUS.PENDING ? 'Pending approval' : 'Donations closed'}
      </div>
    )
  }
  return (
    <Link
      to="/donate/$slug"
      params={{ slug }}
      className={cn(
        'flex items-center justify-center gap-2 bg-donate text-donate-foreground font-bold text-base px-8 py-3.5 rounded-xl hover:bg-donate/90 transition-colors shadow-lg shadow-donate/20 w-full',
        className,
      )}
    >
      <Heart className="w-5 h-5 fill-donate-foreground" />
      Donate Now
    </Link>
  )
}

function DonorItem({ donor }) {
  const name = donor.donor_name ?? donor.donor ?? 'Anonymous'
  const isAnon = donor.is_anonymous ?? donor.anonymous ?? false
  const date = donor.paid_at ?? donor.date
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
        {isAnon ? '?' : name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate">
            {isAnon ? 'Anonymous' : name}
          </p>
          <p className="text-sm font-bold text-primary flex-shrink-0">{formatGMD(donor.amount)}</p>
        </div>
        {donor.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 italic">"{donor.message}"</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{timeAgo(date)}</p>
      </div>
    </div>
  )
}

export function CampaignDetailView({ campaign }) {
  const [tab, setTab] = useState('story')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportForm, setReportForm] = useState({ reason: '', description: '', reporterName: '', reporterPhone: '' })
  const [reportError, setReportError] = useState('')
  const pct = progressPercent(campaign.raised, campaign.goal)
  const days = daysLeft(campaign.deadline)
  const { data: user } = useMe()
  const { data: donorData } = useCampaignDonors(campaign.slug, campaign.id)
  const reportCampaign = useReportCampaign()
  const donations = donorData?.donations ?? []

  const reportReasons = [
    { value: 'fraudulent', label: 'Fraudulent activity' },
    { value: 'misleading', label: 'Misleading information' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'spam', label: 'Spam or scam' },
    { value: 'duplicate', label: 'Duplicate campaign' },
    { value: 'other', label: 'Other' },
  ]

  function handleReportSubmit(e) {
    e.preventDefault()
    if (!reportForm.reason || !reportForm.description.trim()) {
      setReportError('Please select a reason and provide a description.')
      return
    }
    if (!user && (!reportForm.reporterName.trim() || !reportForm.reporterPhone.trim())) {
      setReportError('Please provide your name and phone number.')
      return
    }
    setReportError('')

    const payload = {
      slug: campaign.slug,
      reason: reportForm.reason,
      description: reportForm.description.trim(),
    }

    if (!user) {
      payload.reporter_name = reportForm.reporterName.trim()
      payload.reporter_phone = reportForm.reporterPhone.trim()
    }

    reportCampaign.mutate(payload, {
      onSuccess: () => {
        setShowReportModal(false)
        setReportForm({ reason: '', description: '', reporterName: '', reporterPhone: '' })
      },
      onError: (err) => {
        setReportError(err?.response?.data?.message || 'Failed to submit report. Please try again.')
      },
    })
  }

  const allImages = campaign.images ?? []
  const coverUrl = campaign.cover_image_url ?? allImages.find((img) => img.is_cover)?.image_url ?? null
  const initialMain = coverUrl ?? allImages[0]?.image_url ?? null
  const [mainImage, setMainImage] = useState(initialMain)

  const thumbnails = allImages.filter((img) => img.image_url)

  const tabs = ['story', 'updates', 'donors']

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to={ROUTES.CAMPAIGNS} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" />
        All Campaigns
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className={cn('h-64 sm:h-80 rounded-2xl bg-linear-to-br relative overflow-hidden', campaign.gradient || 'from-primary/60 to-primary')}>
            {mainImage && (
              <img src={mainImage} alt={campaign.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              <span className="bg-black/40 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full">
                {campaign.category?.name ?? campaign.category}
              </span>
              {campaign.is_urgent && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full animate-pulse">
                  URGENT
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail gallery strip */}
          {thumbnails.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {thumbnails.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setMainImage(img.image_url)}
                  className={cn(
                    'flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all',
                    mainImage === img.image_url ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
                  )}
                >
                  <img src={img.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title & Meta */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-3">{campaign.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {campaign.region}, The Gambia
              </span>
              <span>Beneficiary: <strong className="text-foreground">{campaign.beneficiary}</strong></span>
              <span className="flex items-center gap-1">
                By:{' '}
                {campaign.owner_id ? (
                  <Link
                    to="/campaigners/$id"
                    params={{ id: campaign.owner_id }}
                    className="font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {campaign.owner_name || campaign.owner?.name}
                  </Link>
                ) : (
                  <strong className="text-foreground">{campaign.owner_name || campaign.owner?.name}</strong>
                )}
                {campaign.owner_is_verified && <VerifiedTick />}
              </span>
            </div>
          </div>

          {/* Mobile: progress + donate (shown only on mobile) */}
          <div className="lg:hidden bg-card border rounded-2xl p-5 space-y-4">
            <ProgressProgress campaign={campaign} pct={pct} days={days} />
            <DonateButton slug={campaign.slug} status={campaign.status} />
            <div className="flex gap-2">
              <ShareCampaign
                title={campaign.title}
                url={`${window.location.origin}/campaigns/${campaign.slug}`}
                className="flex-1"
              />
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                title="Report a problem with this campaign"
              >
                <Flag className="w-4 h-4" /> Report
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b flex gap-0">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-5 py-3 text-sm font-medium border-b-2 -mb-px capitalize transition-colors',
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t}
                {t === 'updates' && campaign.updates.length > 0 && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5">
                    {campaign.updates.length}
                  </span>
                )}
                {t === 'donors' && donations.length > 0 && (
                  <span className="ml-1.5 bg-muted text-muted-foreground text-xs rounded-full px-1.5 py-0.5">
                    {donations.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'story' && (
            <div className="max-w-none">
              <MarkdownContent content={campaign.story} />
            </div>
          )}

          {tab === 'updates' && (
            <div className="space-y-4">
              {campaign.updates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No updates yet.</p>
              ) : (
                campaign.updates.map((u) => (
                  <div key={u.id} className="border rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{u.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(u.created_at || u.date)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{u.content}</p>
                    {u.posted_by_name && <p className="text-xs text-muted-foreground">— {u.posted_by_name}</p>}
                    {u.images?.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-2">
                        {u.images.map((img) => (
                          <img key={img.id} src={img.image_url} alt="update" className="w-32 h-32 rounded-lg object-cover border" />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'donors' && (
            <div>
              {donations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">Be the first to donate!</p>
                  <DonateButton slug={campaign.slug} status={campaign.status} className="mt-4 max-w-xs mx-auto" />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">{donations.length} recent donations</p>
                  {donations.map((d) => <DonorItem key={d.id} donor={d} />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: sticky donation panel */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-card border rounded-2xl p-5 space-y-5 shadow-xs">
            <ProgressProgress campaign={campaign} pct={pct} days={days} />
            <DonateButton slug={campaign.slug} status={campaign.status} />
            <div className="flex gap-2">
              <ShareCampaign
                title={campaign.title}
                url={`${window.location.origin}/campaigns/${campaign.slug}`}
                className="flex-1"
              />
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                title="Report a problem with this campaign"
              >
                <Flag className="w-4 h-4" /> Report
              </button>
            </div>
            <div className="text-xs text-muted-foreground text-center pt-1 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Secure payments via ModemPay
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full shadow-lg space-y-5">
            <div className="flex items-start justify-between p-5 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Flag className="w-5 h-5 text-destructive" />
                Report Campaign
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setReportError('')
                }}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="px-5 space-y-4">
              {!user && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <input
                      type="text"
                      value={reportForm.reporterName}
                      onChange={(e) => setReportForm((f) => ({ ...f, reporterName: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number *</label>
                    <input
                      type="tel"
                      value={reportForm.reporterPhone}
                      onChange={(e) => setReportForm((f) => ({ ...f, reporterPhone: e.target.value }))}
                      placeholder="Your phone number"
                      className="w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for reporting *</label>
                <select
                  value={reportForm.reason}
                  onChange={(e) => setReportForm((f) => ({ ...f, reason: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a reason...</option>
                  {reportReasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {reportError && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{reportError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false)
                    setReportError('')
                  }}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportCampaign.isPending}
                  className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportCampaign.isPending ? (
                    <><div className="w-3 h-3 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" /> Reporting...</>
                  ) : 'Submit Report'}
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Thank you for helping keep our community safe. Our team will review this report.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressProgress({ campaign, pct, days }) {
  return (
    <div className="space-y-3">
      <ProgressBar value={campaign.raised} max={campaign.goal} />
      <div>
        <p className="text-2xl font-extrabold text-primary">{formatGMD(campaign.raised)}</p>
        <p className="text-sm text-muted-foreground">raised of {formatGMD(campaign.goal)} goal</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center py-2 border rounded-xl">
        <div>
          <p className="text-lg font-bold">{pct}%</p>
          <p className="text-xs text-muted-foreground">funded</p>
        </div>
        <div className="border-x">
          <p className="text-lg font-bold">{campaign.donors_count.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">donors</p>
        </div>
        <div>
          <p className="text-lg font-bold">{days}</p>
          <p className="text-xs text-muted-foreground">days left</p>
        </div>
      </div>
    </div>
  )
}
