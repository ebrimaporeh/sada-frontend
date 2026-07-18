import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Heart, ChevronLeft, CheckCircle2, AlertCircle, Lock, Smartphone, CreditCard } from 'lucide-react'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { formatGMD, progressPercent, daysLeft } from '@/utils/formatters'
import { useDonateToCampaign } from '@/hooks/useDonations'
import { useDonationMethods, useGateways } from '@/hooks/usePayments'
import { useMe } from '@/hooks/useAuth'
import { settings } from '@/settings'
import { cn } from '@/utils/cn'

// Stripe's CardElement renders in a cross-origin iframe, so it can't inherit
// this page's CSS custom properties the way normal DOM elements do — the
// `style` option needs literal resolved color values, computed here from
// the same --foreground/--muted-foreground/--destructive tokens (stored as
// bare "H S% L%" triplets, per this project's Tailwind v4 setup) everything
// else on the page already uses via hsl(var(...)).
function useCardElementOptions() {
  const [colors, setColors] = useState({ foreground: '#111827', mutedForeground: '#6b7280', destructive: '#dc2626' })

  useEffect(() => {
    function resolve() {
      const styles = getComputedStyle(document.documentElement)
      const hsl = (name, fallback) => {
        const value = styles.getPropertyValue(name).trim()
        return value ? `hsl(${value})` : fallback
      }
      setColors({
        foreground: hsl('--foreground', '#111827'),
        mutedForeground: hsl('--muted-foreground', '#6b7280'),
        destructive: hsl('--destructive', '#dc2626'),
      })
    }
    resolve()
    // Theme toggles stamp data-theme on <html> — recompute so the card
    // field's text color still matches if a donor switches theme mid-flow.
    const observer = new MutationObserver(resolve)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return useMemo(() => ({
    style: {
      base: {
        fontSize: '14px',
        color: colors.foreground,
        '::placeholder': { color: colors.mutedForeground },
      },
      invalid: { color: colors.destructive },
    },
  }), [colors])
}

function CampaignSummaryCard({ campaign }) {
  const pct = progressPercent(campaign.raised, campaign.goal)
  return (
    <div className="border rounded-xl p-4 bg-card space-y-3">
      <div className={cn('h-24 rounded-lg bg-linear-to-br flex items-center justify-center', campaign.gradient)}>
        <span className="text-white/40 text-5xl font-black">{(campaign.category?.name ?? campaign.category ?? '')[0]}</span>
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
      <ShareCampaign
        title={campaign.title}
        url={`${window.location.origin}/campaigns/${campaign.slug}`}
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
  const { gateways } = useGateways()
  const stripeGateway = gateways.find((g) => g.code === 'stripe')
  const stripePromise = useMemo(
    () => (stripeGateway?.publishable_key ? loadStripe(stripeGateway.publishable_key) : null),
    [stripeGateway?.publishable_key],
  )

  return (
    <Elements stripe={stripePromise}>
      <DonateCheckoutInner campaign={campaign} />
    </Elements>
  )
}

function DonateCheckoutInner({ campaign }) {
  const { data: me } = useMe()
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const cardElementOptions = useCardElementOptions()
  // Lets a referring flow (e.g. the Zakat calculator) prefill the amount by
  // linking to /donate/$slug?amount=1234.50 instead of the donor retyping it.
  const [amount, setAmount] = useState(search?.amount ? String(search.amount) : '')
  const [provider, setProvider] = useState('')
  const [phone, setPhone] = useState('')
  const [cardComplete, setCardComplete] = useState(false)
  const [donorName, setDonorName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('amount') // amount | payment | confirm
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
  const isCard = selectedMethod?.gateway === 'stripe'

  // Seed user data if authenticated
  const seeded = useRef(false)
  useEffect(() => {
    if (me && !seeded.current) {
      seeded.current = true
      setDonorName(me.full_name)
    }
  }, [me])

  const numAmount = Number(amount)

  function goToPayment() {
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
    setError('')
    setStep('payment')
  }

  function goToConfirm() {
    if (requiresPhone && (!phone.trim() || phone.trim().length < 7)) {
      setError('Please enter a valid phone number')
      return
    }
    if (isCard && !cardComplete) {
      setError('Please enter complete card details')
      return
    }
    setError('')
    setStep('confirm')
  }

  async function submitDonation() {
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
        onSuccess: async (response) => {
          const paymentLink = response?.data?.payment_link
          const clientSecret = response?.data?.client_secret
          const paymentReference = response?.data?.donation?.payment_reference

          if (paymentLink) {
            // The gateway's hosted checkout is a different origin, so this
            // is a full page redirect, not an in-app route change.
            window.location.href = paymentLink
            return
          }

          if (clientSecret && stripe && elements) {
            const cardElement = elements.getElement(CardElement)
            let result
            try {
              result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                  card: cardElement,
                  billing_details: { name: anonymous ? undefined : donorName.trim() || undefined },
                },
              })
            } catch {
              setError('Card payment failed. Please try again.')
              setProcessing(false)
              setStep('confirm')
              return
            }
            if (result.error) {
              setError(result.error.message || 'Card payment failed. Please try again.')
              setProcessing(false)
              setStep('confirm')
              return
            }
            // Confirmed inline — never left the page, so this is a client
            // route change, not a redirect. The success page's own
            // verify-on-mount call reconciles the real status with the
            // backend (same flow ModemPay's redirect return already uses).
            navigate({
              to: '/donate/$slug/success',
              params: { slug: campaign.slug },
              search: { ref: paymentReference, amount: numAmount },
            })
            return
          }

          setError('Could not start payment. Please try again.')
          setProcessing(false)
          setStep('confirm')
        },
        onError: (err) => {
          setError(err?.response?.data?.message || 'Payment failed. Please try again.')
          setProcessing(false)
          setStep('confirm')
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

          {/* Step: Amount */}
          {step === 'amount' && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-3">Choose an amount to donate</p>

                {/* Custom amount input */}
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

              <div className="space-y-3">
                {/* Donor name input */}
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
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}

              <button
                onClick={goToPayment}
                className="w-full bg-donate text-donate-foreground font-bold py-3.5 rounded-xl hover:bg-donate/90 transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-donate/20"
              >
                <Heart className="w-5 h-5 fill-donate-foreground" />
                Donate {numAmount > 0 ? formatGMD(numAmount) : 'Now'}
              </button>
            </div>
          )}

          {/* Step: Payment method */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-3">Select payment method</p>
                {methodsLoading ? (
                  <div className="space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-[62px] rounded-xl border bg-muted/30 animate-pulse" />
                    ))}
                  </div>
                ) : PROVIDERS.length === 0 ? (
                  <p className="text-sm text-muted-foreground border rounded-xl p-3.5">
                    No payment methods are available right now. Please try again shortly.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProvider(p.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-colors text-left',
                          provider === p.id ? 'border-primary bg-primary/5' : 'hover:border-border/80 hover:bg-muted/30',
                        )}
                      >
                        <MethodBadge method={p} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                        {provider === p.id && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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

              {isCard && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Card details
                  </label>
                  <div className="border rounded-lg px-3 py-3 bg-background focus-within:ring-2 focus-within:ring-ring">
                    <CardElement
                      options={cardElementOptions}
                      onChange={(e) => { setCardComplete(e.complete); if (e.error) setError(e.error.message); else setError('') }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Your card details are handled directly by Stripe — this site never sees your card number.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('amount')} className="flex-1 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Back
                </button>
                <button
                  onClick={goToConfirm}
                  disabled={!selectedMethod}
                  className="flex-1 bg-donate text-donate-foreground font-bold py-2.5 rounded-xl hover:bg-donate/90 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-5">
              <div className="border rounded-xl divide-y bg-card">
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Donating to</p>
                  <p className="font-semibold text-sm">{campaign.title}</p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Donation</p>
                    <p className="font-bold text-primary">{formatGMD(numAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Via</p>
                    <p className="font-medium text-sm">{selectedMethod?.name}</p>
                  </div>
                  {requiresPhone && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium text-sm">+220 {phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Donor</p>
                    <p className="font-medium text-sm">{anonymous ? 'Anonymous' : donorName || 'Not provided'}</p>
                  </div>
                </div>
                {message && (
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Your message</p>
                    <p className="text-sm italic">"{message}"</p>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs text-amber-800">
                <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {isCard
                  ? 'After clicking "Confirm Donation", your card will be charged directly on this page.'
                  : 'After clicking "Confirm Donation", you\'ll be taken to a secure payment page to complete your donation.'}
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="flex-1 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Back
                </button>
                <button
                  onClick={submitDonation}
                  disabled={processing || donateToCampaign.isPending || (isCard && !stripe)}
                  className="flex-1 bg-donate text-donate-foreground font-bold py-2.5 rounded-xl hover:bg-donate/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-donate-foreground/30 border-t-donate-foreground rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Confirm Donation
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Payments are processed securely
              </p>
            </div>
          )}
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
