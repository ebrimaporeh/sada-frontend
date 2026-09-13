import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Link as LinkIcon, Check, Download, SquarePen, Loader2 } from 'lucide-react'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { PosterThumbnail } from '@/features/fundraisingStudio/poster/PosterThumbnail'
import { exportPosterAsPng } from '@/features/fundraisingStudio/poster/exportPoster'
import { buildInitialDesign } from '@/features/fundraisingStudio/poster/templateCompositions'
import { useCreatePoster } from '@/hooks/usePosters'
import { campaignShareUrl } from '@/utils/shareUrls'
import { ROUTES } from '@/constants'

// Square reads best in a narrow column and needs the least cropping of a
// typical cover photo -- see posterTemplates.js for the other shapes.
const DEFAULT_TEMPLATE = 'square'

export function CampaignLaunchedScreen({ campaign, onManage }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const stageRef = useRef(null)
  const createPoster = useCreatePoster()
  const shareUrl = campaignShareUrl(campaign.slug)

  // Same shape services/fundraising_destination.py builds server-side for a
  // saved poster's `destination` -- CampaignDetailSerializer doesn't carry
  // organization_logo_url/public_url/donation_url, so they're filled in
  // here. Nothing the default template's own bindings
  // (templateCompositions.js) actually reads is missing.
  const destination = {
    type: 'campaign',
    id: campaign.id,
    title: campaign.title,
    description: campaign.short_description,
    cover_image_url: campaign.cover_image_url,
    organization_name: campaign.organization_name,
    organization_logo_url: null,
    currency: campaign.currency,
    goal: campaign.goal,
    raised: campaign.raised,
    progress_percent: campaign.progress_percent,
    deadline: campaign.deadline,
    is_ongoing: !campaign.deadline,
    public_url: shareUrl,
    donation_url: shareUrl,
  }
  const design = buildInitialDesign(DEFAULT_TEMPLATE, 'campaign')

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadPoster() {
    if (!stageRef.current) return
    exportPosterAsPng(stageRef.current, {
      pixelRatio: 2,
      filename: `${campaign.slug}-poster.png`,
      width: design.width,
      height: design.height,
    })
  }

  // Only actually creates the Poster record (and burns a name/row for it)
  // once someone asks to edit it -- not eagerly on every launch, which
  // would otherwise clutter the Posters list with one nobody ever opens.
  function handleEditPoster() {
    createPoster.mutate(
      {
        destination_type: 'campaign',
        campaign_id: campaign.id,
        name: `${campaign.title} Poster`,
        template: DEFAULT_TEMPLATE,
        design,
      },
      { onSuccess: (res) => navigate({ to: ROUTES.FUNDRAISING_POSTER_DETAIL, params: { id: res.data.poster.id } }) },
    )
  }

  return (
    <div className="max-w-3xl mx-auto text-center space-y-6 py-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Campaign Live!</h2>
        <p className="text-muted-foreground mt-1">
          "{campaign.title}" is live and ready to accept donations. Here's how to get the word out.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-left items-start">
        <div className="border rounded-xl p-4 bg-card space-y-3">
          <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
            <PosterThumbnail design={design} destination={destination} stageRef={stageRef} />
          </div>
          <div>
            <p className="text-sm font-semibold">Your campaign poster</p>
            <p className="text-xs text-muted-foreground">
              Ready-made with your QR code and cover photo - download it or open the editor to customize it.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadPoster}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium border px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              type="button"
              onClick={handleEditPoster}
              disabled={createPoster.isPending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium border px-3 py-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            >
              {createPoster.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SquarePen className="w-3.5 h-3.5" />} Edit
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full border rounded-xl p-4 bg-card hover:bg-accent transition-colors flex items-center gap-3 text-left"
          >
            <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              {copied ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{copied ? 'Link copied!' : 'Copy link'}</p>
              <p className="text-xs text-muted-foreground truncate">{shareUrl}</p>
            </div>
          </button>

          <ShareCampaign
            title={campaign.title}
            url={shareUrl}
            buttonClassName="border rounded-xl p-4 bg-card hover:bg-accent transition-colors flex items-center gap-3 text-left w-full"
            buttonLabel="Share your campaign"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onManage}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
      >
        Manage my campaign
      </button>
    </div>
  )
}
