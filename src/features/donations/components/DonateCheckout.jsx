import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { Heart, ChevronLeft, CheckCircle2, AlertCircle, Lock, Smartphone } from 'lucide-react'
import { ProgressBar } from '@/components/custom/ProgressBar'
import { ShareCampaign } from '@/components/custom/ShareCampaign'
import { formatGMD, progressPercent, daysLeft } from '@/utils/formatters'
import { useDonateToCampaign } from '@/hooks/useDonations'
import { useMe } from '@/hooks/useAuth'
import { settings } from '@/settings'
import { PAYMENT_METHODS } from '@/constants'
import { cn } from '@/utils/cn'

const PROVIDERS = PAYMENT_METHODS

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

export function DonateCheckout({ campaign }) {
  const { data: me } = useMe()
  const [amount, setAmount] = useState('')
  const [provider, setProvider] = useState('wave')
  const [phone, setPhone] = useState('')
  const [donorName, setDonorName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('amount') // amount | payment | confirm
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const donateToCampaign = useDonateToCampaign()
  const isAuthenticated = Boolean(me)

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
    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please enter a valid phone number')
      return
    }
    setError('')
    setStep('confirm')
  }

  function submitDonation() {
    setProcessing(true)
    setError('')
    donateToCampaign.mutate(
      {
        campaign_id: campaign.id,
        slug: campaign.slug,
        amount: numAmount,
        provider,
        phone: `+220${phone.trim()}`,
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
            setStep('confirm')
            return
          }
          // ModemPay's hosted checkout is a different origin, so this is a
          // full page redirect, not an in-app route change.
          window.location.href = paymentLink
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
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0', p.color)}>
                        {p.short}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                      {provider === p.id && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

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
                  className="flex-1 bg-donate text-donate-foreground font-bold py-2.5 rounded-xl hover:bg-donate/90 transition-colors"
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
                    <p className="font-medium text-sm">{PROVIDERS.find((p) => p.id === provider)?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium text-sm">+220 {phone}</p>
                  </div>
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
                After clicking "Confirm Donation", you'll be taken to ModemPay's secure payment page to complete your donation.
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
                  disabled={processing || donateToCampaign.isPending}
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
                <Lock className="w-3 h-3" /> Secured by ModemPay
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
