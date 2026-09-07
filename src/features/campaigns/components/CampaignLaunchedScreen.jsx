import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Image, Code2, Link as LinkIcon, Check, ArrowRight } from 'lucide-react'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { CampaignQrCode } from './CampaignQrCode'
import { campaignShareUrl } from '@/utils/shareUrls'
import { ROUTES } from '@/constants'

export function CampaignLaunchedScreen({ campaign, onManage }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = campaignShareUrl(campaign.slug)

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6 py-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Campaign Live!</h2>
        <p className="text-muted-foreground mt-1">
          "{campaign.title}" is live and ready to accept donations. Here's how to get the word out.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-left">
        <Link
          to={ROUTES.FUNDRAISING_POSTER_NEW}
          search={{ destinationType: 'campaign', destinationId: campaign.id }}
          className="border rounded-xl p-4 bg-card hover:bg-accent transition-colors flex items-center gap-3"
        >
          <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Image className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Create a poster</p>
            <p className="text-xs text-muted-foreground">Design a shareable poster</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </Link>

        <Link
          to={ROUTES.FUNDRAISING_EMBED_NEW}
          search={{ destinationType: 'campaign', destinationId: campaign.id }}
          className="border rounded-xl p-4 bg-card hover:bg-accent transition-colors flex items-center gap-3"
        >
          <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Create an embed</p>
            <p className="text-xs text-muted-foreground">Add a donate widget to your site</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </Link>

        <button
          type="button"
          onClick={handleCopyLink}
          className="border rounded-xl p-4 bg-card hover:bg-accent transition-colors flex items-center gap-3 text-left"
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
          buttonClassName="border rounded-xl p-4 bg-card hover:bg-accent transition-colors flex items-center gap-3 text-left w-full h-full"
          buttonLabel="Share your campaign"
        />
      </div>

      <div className="text-left">
        <CampaignQrCode url={shareUrl} fileName={`${campaign.slug}-qr-code.png`} />
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
