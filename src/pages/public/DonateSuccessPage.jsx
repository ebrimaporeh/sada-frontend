import { Link, useParams, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Heart, Share2, ArrowRight } from 'lucide-react'
import { useCampaign } from '@/hooks/useCampaigns'
import { formatGMD } from '@/utils/formatters'
import { ROUTES } from '@/constants'

export function DonateSuccessPage() {
  const { slug } = useParams({ strict: false })
  const search = useSearch({ strict: false })
  const { campaign } = useCampaign(slug)
  const amount = Number(search?.amount) || 0

  const shareText = campaign
    ? `I just donated to "${campaign.title}" on GambiaFund! Join me in supporting this cause.`
    : 'I just made a donation on GambiaFund!'

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: campaign?.title || 'GambiaFund', text: shareText, url: window.location.origin + `/campaigns/${slug}` })
    } else {
      navigator.clipboard.writeText(window.location.origin + `/campaigns/${slug}`)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-donate flex items-center justify-center">
            <Heart className="w-4 h-4 text-donate-foreground fill-donate-foreground" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Thank You!</h1>
        {amount > 0 && (
          <p className="text-muted-foreground">
            Your donation of <span className="font-bold text-primary">{formatGMD(amount)}</span> has been received.
          </p>
        )}
        {campaign && (
          <p className="text-muted-foreground text-sm">
            You're supporting: <span className="font-semibold text-foreground">{campaign.title}</span>
          </p>
        )}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-2 text-sm">
        <p className="font-semibold">What happens next?</p>
        <ul className="space-y-1.5 text-muted-foreground text-left">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            Your payment is being processed by ModemPay
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            The campaign owner will be notified immediately
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            You'll receive a confirmation once the payment is confirmed
          </li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Help this campaign reach its goal — share it with your friends and family on WhatsApp and social media.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShare}
          className="flex-1 inline-flex items-center justify-center gap-2 border font-semibold px-5 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm"
        >
          <Share2 className="w-4 h-4" /> Share Campaign
        </button>
        {campaign && (
          <Link
            to="/campaigns/$slug"
            params={{ slug: campaign.slug }}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            View Campaign <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <Link to={ROUTES.CAMPAIGNS} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
        Browse more campaigns <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
