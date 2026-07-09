import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { Banknote, Smartphone, CheckCircle2, AlertCircle, Lock, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { useRequestPayout, usePlatformSettings } from '@/hooks/usePayments'
import { useMe } from '@/hooks/useAuth'
import { PAYMENT_METHODS, PAYOUT_METHODS } from '@/constants'
import { formatGMD, formatDateTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function WithdrawTab({ campaign, payouts, availableBalance, totalPaidOut }) {
  const { data: me } = useMe()
  const requestPayout = useRequestPayout()
  const { data: platformSettings } = usePlatformSettings()
  const feePercent = Number(platformSettings?.platform_fee_percent ?? 1)

  const [amount, setAmount] = useState('')
  const [provider, setProvider] = useState('wave')
  const [phone, setPhone] = useState('')
  const [useDefault, setUseDefault] = useState(false)
  const [showAlternate, setShowAlternate] = useState(true)
  const [step, setStep] = useState('form') // form | confirm | processing | done
  const [error, setError] = useState('')

  // Seed provider/phone from user defaults once when me loads
  const defaultSeeded = useRef(false)
  useEffect(() => {
    if (me && !defaultSeeded.current) {
      defaultSeeded.current = true
      const dp = me.default_payment_provider || ''
      const dph = (me.default_payment_phone || '').replace(/^\+220/, '')
      if (dp && dph) {
        setProvider(dp)
        setPhone(dph)
        setUseDefault(true)
        setShowAlternate(false)
      }
    }
  }, [me])

  const defaultProvider = me?.default_payment_provider || ''
  const defaultPhone = (me?.default_payment_phone || '').replace(/^\+220/, '')
  const hasDefault = Boolean(defaultProvider && defaultPhone)

  const numAmount = Number(amount)
  const fee = numAmount ? Math.ceil(numAmount * (feePercent / 100)) : 0
  const youReceive = numAmount - fee

  const activeProvider = useDefault && hasDefault ? defaultProvider : provider
  const activePhone = useDefault && hasDefault ? defaultPhone : phone
  const activeProviderMeta = PAYMENT_METHODS.find((p) => p.id === activeProvider)

  function validate() {
    if (!numAmount || numAmount < 50) { setError('Minimum withdrawal is D 50'); return false }
    if (numAmount > availableBalance) { setError(`Maximum available is ${formatGMD(availableBalance)}`); return false }
    if (!activePhone.trim() || activePhone.trim().length < 7) { setError('Enter a valid phone number'); return false }
    setError('')
    return true
  }

  function handleConfirm() {
    if (!validate()) return
    setStep('confirm')
  }

  function handleSubmit() {
    setStep('processing')
    requestPayout.mutate(
      {
        campaign_id: campaign.id,
        slug: campaign.slug,
        amount: numAmount,
        provider: activeProvider,
        phone: `+220${activePhone.trim()}`,
      },
      {
        onSuccess: () => setStep('done'),
        onError: (err) => {
          setError(err?.response?.data?.message || 'Withdrawal request failed. Please try again.')
          setStep('confirm')
        },
      },
    )
  }

  if (step === 'done') {
    return (
      <div className="text-center py-16 space-y-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Withdrawal Initiated!</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {formatGMD(numAmount)} will arrive on your {activeProviderMeta?.name} account within 10 minutes.
          </p>
        </div>
        <button
          onClick={() => { setStep('form'); setAmount(''); if (!hasDefault) setPhone('') }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          Make Another Withdrawal
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance banner — full width */}
      <div className="border rounded-2xl bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Available Balance</p>
            <p className="text-4xl font-extrabold text-primary">{formatGMD(availableBalance)}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Banknote className="w-7 h-7 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t pt-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Total Raised</p>
            <p className="font-semibold">{formatGMD(campaign.raised)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Withdrawn</p>
            <p className="font-semibold">{formatGMD(totalPaidOut)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="font-semibold">{formatGMD(Math.max(0, campaign.raised - totalPaidOut - availableBalance))}</p>
          </div>
        </div>
      </div>

      {availableBalance === 0 ? (
        <div className="border rounded-2xl p-12 text-center space-y-2 bg-card">
          <Banknote className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="font-semibold">No funds available</p>
          <p className="text-sm text-muted-foreground">All raised funds have been withdrawn.</p>
        </div>
      ) : step === 'form' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: amount */}
          <div className="border rounded-2xl bg-card p-5 space-y-5">
            <h3 className="font-semibold border-b pb-3">Withdrawal Amount</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (GMD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">D</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError('') }}
                  placeholder="0"
                  min="50"
                  max={availableBalance}
                  className="w-full pl-8 pr-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring text-2xl font-bold"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[availableBalance, Math.floor(availableBalance / 2), Math.floor(availableBalance / 4)]
                  .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
                  .slice(0, 3)
                  .map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className="text-xs px-3 py-1.5 border rounded-lg hover:bg-accent transition-colors font-medium"
                    >
                      {v === availableBalance ? 'Full amount' : formatGMD(v)}
                    </button>
                  ))}
              </div>
            </div>

            {numAmount > 0 && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                {[
                  ['Withdrawal amount', formatGMD(numAmount)],
                  [`Processing fee (${feePercent}%)`, `- ${formatGMD(fee)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>You receive</span>
                  <span className="text-primary">{formatGMD(youReceive)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: payment method */}
          <div className="border rounded-2xl bg-card p-5 space-y-5">
            <h3 className="font-semibold border-b pb-3">Receive To</h3>

            {hasDefault ? (
              <div className="space-y-3">
                {/* Default account card */}
                <button
                  type="button"
                  onClick={() => { setUseDefault(true); setShowAlternate(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                    useDefault ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0', activeProviderMeta?.color || 'bg-muted')}>
                    {PAYMENT_METHODS.find((p) => p.id === defaultProvider)?.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{PAYMENT_METHODS.find((p) => p.id === defaultProvider)?.name}</p>
                    <p className="text-sm text-muted-foreground">+220 {defaultPhone}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">Default</span>
                    {useDefault && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                </button>

                {/* Use different account toggle */}
                <button
                  type="button"
                  onClick={() => { setShowAlternate((v) => !v); setUseDefault(showAlternate) }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Use a different account</span>
                  {showAlternate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAlternate && (
                  <div className="space-y-3 pt-1 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      {PAYOUT_METHODS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setProvider(p.id); setUseDefault(false) }}
                          className={cn(
                            'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-colors',
                            !useDefault && provider === p.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                          )}
                        >
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', p.color)}>
                            {p.short}
                          </div>
                          <p className="text-xs font-semibold">{p.name}</p>
                          {!useDefault && provider === p.id && <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+220</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setUseDefault(false); setError('') }}
                        placeholder="7XXXXXXX"
                        className="w-full pl-14 pr-4 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-xs text-amber-800">
                  <Settings className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Save a default payment account in{' '}
                    <Link to="/settings" className="font-semibold underline">Settings → Payment Settings</Link>{' '}
                    to skip this step next time.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Network</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYOUT_METHODS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProvider(p.id)}
                        className={cn(
                          'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors',
                          provider === p.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                        )}
                      >
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', p.color)}>
                          {p.short}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">{p.name}</p>
                        </div>
                        {provider === p.id && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Phone number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+220</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError('') }}
                      placeholder="7XXXXXXX"
                      className="w-full pl-14 pr-4 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Banknote className="w-5 h-5" /> Continue to Confirm
            </button>
          </div>
        </div>
      ) : step === 'confirm' ? (
        <div className="border rounded-2xl bg-card p-5 space-y-5 max-w-md">
          <h3 className="font-semibold">Confirm Withdrawal</h3>

          <div className="border rounded-xl divide-y">
            {[
              ['Amount', formatGMD(numAmount)],
              [`Processing fee (${feePercent}%)`, `- ${formatGMD(fee)}`],
              ['You receive', formatGMD(youReceive)],
              ['Provider', activeProviderMeta?.name],
              ['Phone', `+220 ${activePhone}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-semibold', label === 'You receive' && 'text-primary text-base')}>{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2 text-xs text-blue-800">
            <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5" />
            After confirming, funds will be sent to +220 {activePhone} within 10 minutes.
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="flex-1 border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Lock className="w-4 h-4" /> Confirm Withdrawal
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded-2xl bg-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="font-semibold">Processing withdrawal…</p>
          <p className="text-sm text-muted-foreground">Please wait while we initiate your payout.</p>
        </div>
      )}

      {payouts.length > 0 && (
        <div className="border rounded-2xl bg-card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">Withdrawal History</h3>
          </div>
          <div className="divide-y">
            {payouts.map((p) => {
              const provMeta = PAYMENT_METHODS.find((m) => m.id === p.provider)
              return (
                <div key={p.id} className="flex items-center justify-between px-5 py-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {provMeta && (
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0', provMeta.color)}>
                        {provMeta.short}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{formatGMD(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{provMeta?.name || p.provider} · +220 {p.phone?.replace(/^\+220/, '')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(p.completed_at || p.requested_at)}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 capitalize',
                    p.status === 'completed' ? 'bg-green-100 text-green-700' :
                    p.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700',
                  )}>
                    {p.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
