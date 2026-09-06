import { useState, useEffect, useRef } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { Heart, ChevronLeft, CheckCircle2, AlertCircle, Lock, Smartphone, CreditCard, Building2, ShieldCheck } from 'lucide-react'
import { formatGMD } from '@/utils/formatters'
import { useDonateToOrganization } from '@/hooks/useDonations'
import { useDonationMethods } from '@/hooks/usePayments'
import { useMe } from '@/hooks/useAuth'
import { settings } from '@/settings'
import { cn } from '@/utils/cn'
import { storage } from '@/utils/storage'
import { usePageMeta } from '@/hooks/usePageMeta'

const GUEST_DONOR_STORAGE_KEY = 'guest_donor_info'

function OrganizationSummaryCard({ organization }) {
  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="h-24 bg-linear-to-br from-primary/20 to-primary/5 overflow-hidden flex items-center justify-center">
        {organization.cover_image ? (
          <img src={organization.cover_image} alt={organization.organization_name} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-10 h-10 text-primary/40" />
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 overflow-hidden -mt-8 border-4 border-card">
            {organization.logo ? (
              <img src={organization.logo} alt={organization.organization_name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-snug truncate">{organization.organization_name}</p>
            <p className="text-xs text-muted-foreground">{organization.organization_type_name}</p>
          </div>
        </div>
        {organization.is_verified && (
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Organization
          </span>
        )}
        {organization.description && (
          <p className="text-sm text-muted-foreground">{organization.description}</p>
        )}
        <div className="border-t pt-3 text-xs text-muted-foreground">
          <span className="font-bold text-primary">{formatGMD(organization.total_raised)}</span> raised so far
        </div>
      </div>
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

// Amount presets aren't used on the campaign checkout (a plain custom-amount
// field there, see DonateCheckout.jsx), but the org donate page's mockup
// calls for quick-pick buttons -- settings.donate.presets already exists for
// exactly this, just unused until now.
const AMOUNT_PRESETS = settings.donate.presets.slice(0, 4)

export function OrganizationDonateCheckout({ organization }) {
  const { data: me } = useMe()
  const search = useSearch({ strict: false })
  usePageMeta({ title: `Support ${organization.organization_name}`, noindex: true })

  const [amount, setAmount] = useState(search?.amount ? String(search.amount) : '')
  const [customMode, setCustomMode] = useState(false)
  const [provider, setProvider] = useState('')
  const [phone, setPhone] = useState('')
  const [donorName, setDonorName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const donateToOrganization = useDonateToOrganization()
  const { methods: PROVIDERS, isLoading: methodsLoading } = useDonationMethods()

  useEffect(() => {
    if (!provider && PROVIDERS.length > 0) {
      setProvider(PROVIDERS[0].id)
    }
  }, [provider, PROVIDERS])

  const selectedMethod = PROVIDERS.find((p) => p.id === provider)
  const requiresPhone = selectedMethod?.requiresPhone ?? true
  const minAmount = selectedMethod?.minDonationAmount ?? settings.donate.minAmount
  const maxAmount = selectedMethod?.maxDonationAmount ?? settings.donate.maxAmount

  const seeded = useRef(false)
  useEffect(() => {
    if (me && !seeded.current) {
      seeded.current = true
      setDonorName(me.full_name)
    }
  }, [me])

  useEffect(() => {
    const cached = storage.get(GUEST_DONOR_STORAGE_KEY)
    if (!cached) return
    if (cached.donorName) setDonorName(cached.donorName)
    if (cached.phone) setPhone(cached.phone)
    if (cached.provider) setProvider(cached.provider)
  }, [])

  const numAmount = Number(amount)

  function handleDonate() {
    if (!numAmount || numAmount < minAmount) {
      setError(`Minimum donation is ${formatGMD(minAmount)}`)
      return
    }
    if (numAmount > maxAmount) {
      setError(`Maximum donation is ${formatGMD(maxAmount)} per transaction. Please split larger amounts into multiple donations.`)
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
    donateToOrganization.mutate(
      {
        organization_id: organization.id,
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
          if (!me) {
            storage.set(GUEST_DONOR_STORAGE_KEY, { donorName: donorName.trim(), phone: phone.trim(), provider })
          }
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
        to="/give/$slug"
        params={{ slug: organization.slug }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Support {organization.organization_name}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              You're donating directly to this organization — not to a specific campaign. Your contribution helps them
              continue their work.
            </p>
          </div>

          <div className="space-y-5">
            {/* Amount */}
            <div>
              <p className="text-sm font-medium mb-3">Choose an amount to donate</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setAmount(String(preset)); setCustomMode(false); setError('') }}
                    className={cn(
                      'py-2.5 rounded-lg border text-sm font-bold transition-colors',
                      !customMode && Number(amount) === preset ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary' : 'hover:border-border/80 hover:bg-muted/30',
                    )}
                  >
                    {formatGMD(preset)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setCustomMode(true); setAmount(''); setError('') }}
                  className={cn(
                    'py-2.5 rounded-lg border text-sm font-bold transition-colors',
                    customMode ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary' : 'hover:border-border/80 hover:bg-muted/30',
                  )}
                >
                  Custom
                </button>
              </div>
              {customMode && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">D</span>
                  <input
                    type="number"
                    autoFocus
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError('') }}
                    placeholder="Custom amount"
                    min={minAmount}
                    max={maxAmount}
                    className="w-full pl-8 pr-4 py-2.5 border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring text-lg font-bold"
                  />
                </div>
              )}
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

            <div>
              <label className="text-sm font-medium block mb-1.5">Leave a message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Words of encouragement..."
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
              disabled={processing || donateToOrganization.isPending}
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
                  {numAmount > 0 ? `Donate ${formatGMD(numAmount)}` : 'Donate Now'}
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Payments are processed securely — you'll be taken to {selectedMethod?.gateway === 'stripe' ? "Stripe's" : 'your provider\'s'} page to complete it
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <p className="text-sm font-medium mb-3 hidden lg:block">You're supporting</p>
          <OrganizationSummaryCard organization={organization} />
        </div>
      </div>
    </div>
  )
}
