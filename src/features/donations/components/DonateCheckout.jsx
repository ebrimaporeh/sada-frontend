import { useState, useEffect, useRef } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { Heart, ChevronLeft, CheckCircle2, AlertCircle, Lock, Smartphone, CreditCard } from 'lucide-react'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { formatGMD, progressPercent, daysLeft } from '@/utils/formatters'
import { useDonateToCampaign } from '@/hooks/useDonations'
import { useDonationMethods } from '@/hooks/usePayments'
import { useMe } from '@/hooks/useAuth'
import { settings } from '@/settings'
import { cn } from '@/utils/cn'
import { storage } from '@/utils/storage'
import { campaignShareUrl } from '@/utils/shareUrls'
import { usePageMeta } from '@/hooks/usePageMeta'

const GUEST_DONOR_STORAGE_KEY = 'guest_donor_info'

function CampaignSummaryCard({ campaign }) {
  const pct = progressPercent(campaign.raised, campaign.goal)
  const coverUrl = campaign.cover_image_url
    ?? campaign.images?.find((img) => img.is_cover)?.image_url
    ?? campaign.images?.[0]?.image_url
    ?? null

  return (
    <div className="border rounded-xl p-4 bg-card space-y-3">
      <div className={cn('h-24 rounded-lg bg-linear-to-br overflow-hidden flex items-center justify-center', campaign.gradient)}>
        {coverUrl ? (
          <img src={coverUrl} alt={campaign.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white/40 text-5xl font-black">{(campaign.category?.name ?? campaign.category ?? '')[0]}</span>
        )}
      </div>
      <div>
        <p className="font-semibold text-sm leading-snug">{campaign.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{campaign.region} · {campaign.category?.name ?? campaign.category}</p>
      </div>
      <ProgressBar value={campaign.raised} max={campaign.goal} />
      <div className="flex justify-between text-xs">
        <span className="font-bold text-primary">{formatGMD(campaign.raised)} raised</span>
        <span className="text-muted-foreground">{pct}% of {formatGMD(campaign.goal)}</span>
      </div>
      <div className="text-xs text-muted-foreground border-t pt-2">
        <span>{campaign.donors_count} donors · {daysLeft(campaign.deadline)} days left</span>
      </div>
      {/* Bottom, not overlaid on the image — the image's overflow-hidden
          was clipping the share popover the moment it opened downward,
          making it render but stay invisible. */}
      <ShareCampaign
        title={campaign.title}
        url={campaignShareUrl(campaign.slug)}
        className="border-t pt-3"
        buttonClassName="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        buttonLabel="Share this campaign"
      />
    </div>
  )
}

function MethodBadge({ method, size = 'w-10 h-10' }) {
  if (method?.logo) {
    return (
      <div className={cn(size, 'rounded-lg bg-white border flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5')}>
        <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
      </div>
    )
  }
  return (
    <div className={cn(size, 'rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0', method?.color)}>
      {method?.id === 'card' ? <CreditCard className="w-5 h-5" /> : method?.short}
    </div>
  )
}

export function DonateCheckout({ campaign }) {
  const { data: me } = useMe()
  const search = useSearch({ strict: false })
  // Checkout pages aren't content worth ranking, and indexing them just
  // sends search traffic to a dead-end form instead of the campaign page.
  usePageMeta({ title: `Donate to ${campaign.title}`, noindex: true })
  // Lets a referring flow (e.g. the Zakat calculator) prefill the amount by
  // linking to /donate/$slug?amount=1234.50 instead of the donor retyping it.
  const [amount, setAmount] = useState(search?.amount ? String(search.amount) : '')
  const [provider, setProvider] = useState('')
  const [phone, setPhone] = useState('')
  const [donorName, setDonorName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const donateToCampaign = useDonateToCampaign()
  const { methods: PROVIDERS, isLoading: methodsLoading } = useDonationMethods()

  // Default to whichever method loads first, once the backend's enabled
  // gateways are known — can't hardcode 'wave' since that gateway might be
  // disabled, or Stripe might be the only one enabled.
  useEffect(() => {
    if (!provider && PROVIDERS.length > 0) {
      setProvider(PROVIDERS[0].id)
    }
  }, [provider, PROVIDERS])

  const selectedMethod = PROVIDERS.find((p) => p.id === provider)
  const requiresPhone = selectedMethod?.requiresPhone ?? true

  // Seed user data if authenticated
  const seeded = useRef(false)
  useEffect(() => {
    if (me && !seeded.current) {
      seeded.current = true
      setDonorName(me.full_name)
    }
  }, [me])

  // A guest who donated before on this browser shouldn't have to retype
  // their name/phone/payment method. If this turns out to be a logged-in
  // user, the effect above re-fires once their profile loads and
  // overwrites donorName with the real account name.
  useEffect(() => {
    const cached = storage.get(GUEST_DONOR_STORAGE_KEY)
    if (!cached) return
    if (cached.donorName) setDonorName(cached.donorName)
    if (cached.phone) setPhone(cached.phone)
    if (cached.provider) setProvider(cached.provider)
  }, [])

  const numAmount = Number(amount)

  function handleDonate() {
    if (!numAmount || numAmount < settings.donate.minAmount) {
      setError(`Minimum donation is ${formatGMD(settings.donate.minAmount)}`)
      return
    }
    if (numAmount > settings.donate.maxAmount) {
      setError(`Maximum donation is ${formatGMD(settings.donate.maxAmount)} per transaction. Please split larger amounts into multiple donations.`)
      return
    }
    if (!anonymous && !donorName.trim()) {
      setError('Please enter your name or choose to donate anonymously')
      return
    }
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }
    if (requiresPhone && (!phone.trim() || phone.trim().length < 7)) {
      setError('Please enter a valid phone number')
      return
    }
    setError('')
    submitDonation()
  }

  function submitDonation() {
    setProcessing(true)
    setError('')
    donateToCampaign.mutate(
      {
        campaign_id: campaign.id,
        slug: campaign.slug,
        amount: numAmount,
        gateway: selectedMethod?.gateway,
        provider,
        phone: requiresPhone ? `+220${phone.trim()}` : '',
        is_anonymous: anonymous,
        message: message.trim() || undefined,
        donor_name: anonymous ? '' : donorName.trim(),
      },
      {
        onSuccess: (response) => {
          const paymentLink = response?.data?.payment_link
          if (!paymentLink) {
            setError('Could not start payment. Please try again.')
            setProcessing(false)
            return
          }
          // Only guests get this convenience — a logged-in donor's info
          // already lives on their account, not a browser-local cache.
          if (!me) {
            storage.set(GUEST_DONOR_STORAGE_KEY, { donorName: donorName.trim(), phone: phone.trim(), provider })
          }
          // The gateway's hosted checkout is a different origin, so this
          // is a full page redirect, not an in-app route change. For Stripe
          // this lands on Stripe's own hosted card-entry page; for
          // Wave/APS it lands on ModemPay's mobile-money payment prompt.
          window.location.href = paymentLink
        },
        onError: (err) => {
          setError(err?.response?.data?.message || 'Payment failed. Please try again.')
          setProcessing(false)
        },
      },
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/campaigns/$slug"
        params={{ slug: campaign.slug }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to campaign
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: form */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Make a Donation</h1>
            <p className="text-muted-foreground text-sm mt-1">Your support makes a real difference.</p>
          </div>

          <div className="space-y-5">
            {/* Amount */}
            <div>
              <p className="text-sm font-medium mb-3">Choose an amount to donate</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">D</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError('') }}
                  placeholder="Amount"
                  min={settings.donate.minAmount}
                  max={settings.donate.maxAmount}
                  className="w-full pl-8 pr-4 py-2.5 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-lg font-bold"
                />
              </div>
            </div>

            {/* Donor name / anonymous */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Your name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Full name"
                  disabled={anonymous}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded" />
                <span className="text-sm">Donate anonymously</span>
              </label>
            </div>

            {/* Payment method cards */}
            <div>
              <p className="text-sm font-medium mb-3">Pay with</p>
              {methodsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => <div key={i} className="h-[84px] rounded-xl border bg-muted/30 animate-pulse" />)}
                </div>
              ) : PROVIDERS.length === 0 ? (
                <p className="text-sm text-muted-foreground border rounded-xl p-3.5">
                  No payment methods are available right now. Please try again shortly.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setProvider(p.id); setError('') }}
                      className={cn(
                        'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors text-center',
                        provider === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-border/80 hover:bg-muted/30',
                      )}
                    >
                      {provider === p.id && <CheckCircle2 className="w-4 h-4 text-primary absolute top-1.5 right-1.5" />}
                      <MethodBadge method={p} size="w-9 h-9" />
                      <span className="text-xs font-semibold">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone number — mobile money only; card donors go straight to Stripe's own card entry page instead */}
            {requiresPhone && (
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  <Smartphone className="w-4 h-4 inline mr-1" />
                  Your phone number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+220</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError('') }}
                    placeholder="7XXXXXXX"
                    className="w-full pl-14 pr-4 py-2.5 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">You'll receive a payment prompt on this number</p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Leave a message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Words of encouragement for the campaign owner..."
                rows={3}
                maxLength={280}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              onClick={handleDonate}
              disabled={processing || donateToCampaign.isPending}
              className="w-full bg-donate text-donate-foreground font-bold py-3.5 rounded-xl hover:bg-donate/90 transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-donate/20 disabled:opacity-70"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-donate-foreground/30 border-t-donate-foreground rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-donate-foreground" />
                  Donate {numAmount > 0 ? formatGMD(numAmount) : 'Now'}
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Payments are processed securely — you'll be taken to {selectedMethod?.gateway === 'stripe' ? "Stripe's" : 'your provider\'s'} page to complete it
            </p>
          </div>
        </div>

        {/* Right: campaign summary */}
        <div className="lg:col-span-2">
          <p className="text-sm font-medium mb-3 hidden lg:block">You're supporting</p>
          <CampaignSummaryCard campaign={campaign} />
        </div>
      </div>
    </div>
  )
}
